const courseSchema = require('../models/courseModel');
const instructorSchema = require('../models/instructorModel');
const studentSchema = require('../models/studentModel');
const offeredCourseSchema = require('../models/offeredCourseModel');
const registeredCourseSchema = require('../models/registeredCourseModel');
const semesterSchema = require('../models/semesterModel');
const programSchema = require('../models/programModel');

async function getCourseSemesterContext(course) {
  if (!course?.semesterId) return null;
  const semester = await semesterSchema.findById(course.semesterId);
  if (!semester) return null;
  const program = await programSchema.findById(semester.programId);
  return {
    semesterId: semester._id.toString(),
    semesterNumber: semester.semesterNumber,
    semesterTitle: semester.title,
    programId: semester.programId,
    programName: program?.name ?? '',
  };
}

const registerCourse = async (_req, res) => {
  return res.status(400).send({
    success: false,
    message: 'Standalone course registration is disabled. Add courses under Admin → Programs → Semester.',
  });
};

const getCourses = async (_req, res) => {
  try {
    const courses = await courseSchema.find({
      semesterId: { $exists: true, $ne: null, $ne: '' },
    });
    if (courses.length) {
      const detail = [];
      for (const course of courses) {
        const ctx = await getCourseSemesterContext(course);
        detail.push({ ...course._doc, ...ctx });
      }
      res.status(200).send({
        success: true,
        message: 'Semester courses fetched successfully!',
        count: detail.length,
        data: detail,
      });
    } else {
      res.status(204).send({
        success: true,
        message: 'No semester courses found. Add courses under a program semester first.',
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while fetching courses.',
      error,
    });
  }
};

const getSingleCourse = async (req, res) => {
  try {
    const id = req.params.id;
    const course = await courseSchema.findById(id);
    if (course) {
      res.status(200).send({
        success: true,
        message: 'Course fetched successfully!',
        data: course,
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'Course not found.',
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while fetching the course.',
      error,
    });
  }
};

const editCourse = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, creditHours, type, code } = req.body;

    const course = await courseSchema.findById(id);
    if (!course) {
      res.status(404).send({
        success: false,
        message: 'Course not found.',
      });
    }

    // validation
    switch (true) {
      case !title:
        return res.status(400).send({
          success: false,
          message: 'Title cannot be empty!',
        });
      case !type:
        return res.status(400).send({
          success: false,
          message: 'Type cannot be empty!',
        });
      case !code:
        return res.status(400).send({
          success: false,
          message: 'Code cannot be empty!',
        });
      default:
        break;
    }

    // editing
    const editedCourse = await courseSchema.findByIdAndUpdate(
      id,
      {
        title,
        creditHours: creditHours ? creditHours : 1,
        type,
        code,
      },
      { new: true }
    );
    if (editedCourse) {
      res.status(200).send({
        success: true,
        message: "Course's information edited successfully!",
        data: editedCourse,
      });
    } else {
      res.status(500).send({
        success: false,
        message: 'Something went wrong while editing the course.',
        error,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while editing the course.',
      error,
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const id = req.params.id;

    const course = await courseSchema.findById(id);
    if (!course) {
      res.status(404).send({
        success: false,
        message: 'Course not found.',
      });
    }

    // deleting data in referenced documents (if needed...)
    // deleting
    const deletedCourse = await courseSchema.findByIdAndDelete(id);
    if (deletedCourse) {
      res.status(200).send({
        success: true,
        message: 'Course deleted successfully!',
        data: deletedCourse,
      });
    } else {
      res.status(500).send({
        success: false,
        message: 'Something went wrong while deleting the course.',
        error,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while deleting the course.',
      error,
    });
  }
};

const registerOfferedCourse = async (req, res) => {
  try {
    const { courseId, instructorId, adminId } = req.body;

    switch (true) {
      case !courseId:
        return res.status(400).send({
          success: false,
          message: 'Course ID is mandatory!',
        });
      case !instructorId:
        return res.status(400).send({
          success: false,
          message: 'Instructor ID is mandatory!',
        });
      case !adminId:
        return res.status(400).send({
          success: false,
          message: 'Admin ID is mandatory!',
        });
      default:
        break;
    }

    const courseExists = await courseSchema.findById(courseId);
    const instructorExists = await instructorSchema.findById(instructorId);
    if (!instructorExists && !courseExists) {
      return res.status(400).send({
        success: false,
        message: 'Neither this course nor this instructor exist.',
      });
    }
    if (!courseExists) {
      return res.status(400).send({
        success: false,
        message: 'This course does not exist.',
      });
    }
    if (!instructorExists) {
      return res.status(400).send({
        success: false,
        message: 'This instructor does not exist.',
      });
    }

    if (!courseExists.semesterId) {
      return res.status(400).send({
        success: false,
        message: 'Only semester program courses can be offered. Add the course under Admin → Programs first.',
      });
    }

    const semesterCtx = await getCourseSemesterContext(courseExists);
    if (!semesterCtx) {
      return res.status(400).send({
        success: false,
        message: 'Could not resolve semester for this course.',
      });
    }

    const otherApproved = await offeredCourseSchema.findOne({
      courseId,
      status: 'approved',
      instructorId: { $ne: instructorId },
    });
    if (otherApproved) {
      return res.status(400).send({
        success: false,
        message: 'This semester course already has an approved instructor.',
      });
    }

    const existing = await offeredCourseSchema.findOne({
      courseId,
      instructorId,
      status: { $in: ['pending', 'approved'] },
    });

    if (existing?.status === 'approved') {
      return res.status(400).send({
        success: false,
        message: 'This instructor is already teaching this course.',
      });
    }

    if (existing?.status === 'pending') {
      return res.status(400).send({
        success: false,
        message: 'An offer is already pending instructor approval for this course.',
      });
    }

    const newOfferedCourse = new offeredCourseSchema({
      courseId,
      instructorId,
      status: 'pending',
      reviewedByAdminId: adminId,
      programId: semesterCtx.programId,
      semesterNumber: semesterCtx.semesterNumber,
    });
    const result = await newOfferedCourse.save();

    if (result) {
      res.status(200).send({
        success: true,
        message: 'Course offer sent. Waiting for instructor approval.',
        data: newOfferedCourse,
      });
    } else {
      res.status(500).send({
        success: false,
        message: 'Something went wrong while assigning the course.',
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while assigning the course.',
      error,
    });
  }
};

const getOfferedCoursesOfInstructor = async (req, res) => {
  try {
    const id = req.params.id;
    const registeredCourses = await offeredCourseSchema.find({
      instructorId: id,
      status: { $in: ['pending', 'approved'] },
    });
    if (registeredCourses.length) {
      let registeredCoursesDetail = [];
      for (let i = 0; i < registeredCourses.length; i++) {
        const element = registeredCourses[i];
        const course = await courseSchema.findById(element.courseId);
        if (course) {
          const ctx = await getCourseSemesterContext(course);
          registeredCoursesDetail.push({
            ...course._doc,
            ...ctx,
            requestId: element._id,
            status: element.status || 'approved',
            reviewedAt: element.reviewedAt,
          });
        }
      }
      res.status(200).send({
        success: true,
        message: 'Offered courses of this instructor fetched successfully!',
        count: registeredCourses.length,
        data: registeredCoursesDetail,
      });
    } else {
      res.status(204).send({
        success: true,
        message: 'No offered courses of this instructor so far.',
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while fetching the courses.',
      error,
    });
  }
};

const registerRegisteredCourse = async (_req, res) => {
  return res.status(400).send({
    success: false,
    message: 'Manual course registration is disabled. Students enroll in a program and receive semester courses automatically.',
  });
};

const getRegisteredCoursesOfStudent = async (req, res) => {
  try {
    const id = req.params.id;
    const registeredCourses = await registeredCourseSchema.find({
      studentId: id,
    });
    if (registeredCourses.length) {
      let registeredCoursesDetail = [];
      for (let i = 0; i < registeredCourses.length; i++) {
        const element = registeredCourses[i];
        const course = await courseSchema.findById(element.courseId);
        const instructor = await instructorSchema.findById(
          element.instructorId
        );
        registeredCoursesDetail.push({
          ...course._doc,
          instructorName: instructor.fname + ' ' + instructor.lname,
        });
      }
      res.status(200).send({
        success: true,
        message: 'Registered courses of this student fetched successfully!',
        count: registeredCourses.length,
        data: registeredCoursesDetail,
      });
    } else {
      res.status(204).send({
        success: true,
        message: 'No registered courses of this student so far.',
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while fetching the courses.',
      error,
    });
  }
};

const getOfferedCourses = async (req, res) => {
  try {
    const registeredCourses = await offeredCourseSchema.find({
      status: "approved",
    });
    if (registeredCourses.length) {
      let registeredCoursesDetail = [];
      for (let i = 0; i < registeredCourses.length; i++) {
        const element = registeredCourses[i];
        const course = await courseSchema.findById(element.courseId);
        const instructor = await instructorSchema.findById(
          element.instructorId
        );
        if (course && instructor) {
          registeredCoursesDetail.push({
            ...course._doc,
            instructorId: instructor._id,
            instructorName: instructor.fname + ' ' + instructor.lname,
          });
        }
      }
      res.status(200).send({
        success: true,
        message: 'Offered courses fetched successfully!',
        count: registeredCourses.length,
        data: registeredCoursesDetail,
      });
    } else {
      res.status(204).send({
        success: true,
        message: 'No offered courses so far.',
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while fetching the courses!.',
      error,
    });
  }
};

const getRegisteredStudentsOfInstructor = async (req, res) => {
  try {
    const id = req.params.id;
    const registeredStudents = await registeredCourseSchema.find({
      instructorId: id,
    });
    if (registeredStudents.length) {
      let registeredStudentsDetail = [];
      for (let i = 0; i < registeredStudents.length; i++) {
        const element = registeredStudents[i];
        const student = await studentSchema.findById(element.studentId);
        const course = await courseSchema.findById(element.courseId);
        if (student && course)
          registeredStudentsDetail.push({
            ...(student._doc),
            courseTitle: course.title,
            courseId: course._id,
            programId: element.programId,
            semesterNumber: element.semesterNumber,
          });
      }
      res.status(200).send({
        success: true,
        message: 'Registered students of this instructor fetched successfully!',
        count: registeredStudents.length,
        data: registeredStudentsDetail,
      });
    } else {
      res.status(204).send({
        success: true,
        message: 'No registered students of this instructor so far.',
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while fetching the students.',
      error,
    });
  }
};

const getOfferedCourseAssignments = async (req, res) => {
  try {
    const assignments = await offeredCourseSchema.find({
      status: { $in: ['pending', 'approved'] },
    });

    if (!assignments.length) {
      return res.status(204).send({
        success: true,
        message: 'No course assignments yet.',
      });
    }

    const detail = [];
    for (let i = 0; i < assignments.length; i++) {
      const item = assignments[i];
      const course = await courseSchema.findById(item.courseId);
      const instructor = await instructorSchema.findById(item.instructorId);
      if (course && instructor) {
        const ctx = await getCourseSemesterContext(course);
        detail.push({
          ...item._doc,
          courseTitle: course.title,
          courseCode: course.code,
          instructorName: instructor.fname + ' ' + instructor.lname,
          instructorEmail: instructor.email,
          assignedAt: item.reviewedAt || item.createdAt,
          programName: ctx?.programName,
          semesterNumber: ctx?.semesterNumber,
          semesterTitle: ctx?.semesterTitle,
        });
      }
    }

    detail.sort(
      (a, b) =>
        new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    );

    res.status(200).send({
      success: true,
      message: 'Course assignments fetched successfully!',
      count: detail.length,
      data: detail,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while fetching course assignments.',
      error,
    });
  }
};

const deleteOfferedCourseAssignment = async (req, res) => {
  try {
    const id = req.params.id;
    const assignment = await offeredCourseSchema.findById(id);

    if (!assignment) {
      return res.status(404).send({
        success: false,
        message: 'Course assignment not found.',
      });
    }

    await offeredCourseSchema.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: 'Course assignment removed successfully.',
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while removing the assignment.',
      error,
    });
  }
};

const instructorReviewOfferedCourse = async (req, res) => {
  try {
    const id = req.params.id;
    const { instructorId, action } = req.body;
    const normalizedAction = String(action || '').toLowerCase();

    if (!instructorId) {
      return res.status(400).send({
        success: false,
        message: 'Instructor ID is mandatory!',
      });
    }
    if (normalizedAction !== 'approve' && normalizedAction !== 'decline') {
      return res.status(400).send({
        success: false,
        message: 'Action must be approve or decline.',
      });
    }

    const offer = await offeredCourseSchema.findById(id);
    if (!offer) {
      return res.status(404).send({
        success: false,
        message: 'Course offer not found.',
      });
    }
    if (offer.instructorId !== instructorId) {
      return res.status(403).send({
        success: false,
        message: 'You are not allowed to review this offer.',
      });
    }
    if (offer.status !== 'pending') {
      return res.status(400).send({
        success: false,
        message: 'This course offer has already been reviewed.',
      });
    }

    if (normalizedAction === 'approve') {
      const otherApproved = await offeredCourseSchema.findOne({
        courseId: offer.courseId,
        status: 'approved',
        instructorId: { $ne: offer.instructorId },
      });
      if (otherApproved) {
        return res.status(400).send({
          success: false,
          message: 'Another instructor is already approved for this semester course.',
        });
      }
      const approvedExists = await offeredCourseSchema.findOne({
        courseId: offer.courseId,
        instructorId: offer.instructorId,
        status: 'approved',
        _id: { $ne: offer._id },
      });
      if (approvedExists) {
        offer.status = 'declined';
      } else {
        offer.status = 'approved';
      }
    } else {
      offer.status = 'declined';
    }

    offer.reviewedAt = new Date();
    await offer.save();

    res.status(200).send({
      success: true,
      message:
        offer.status === 'approved'
          ? 'Course offer accepted. You are now assigned to teach this course.'
          : 'Course offer declined.',
      data: offer,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while reviewing the course offer.',
      error,
    });
  }
};

module.exports = {
  registerCourse,
  getCourses,
  getSingleCourse,
  editCourse,
  deleteCourse,
  registerOfferedCourse,
  getOfferedCoursesOfInstructor,
  registerRegisteredCourse,
  getRegisteredCoursesOfStudent,
  getOfferedCourses,
  getRegisteredStudentsOfInstructor,
  getOfferedCourseAssignments,
  deleteOfferedCourseAssignment,
  instructorReviewOfferedCourse,
};
