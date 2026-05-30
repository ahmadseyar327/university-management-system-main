const courseSchema = require('../models/courseModel');
const instructorSchema = require('../models/instructorModel');
const studentSchema = require('../models/studentModel');
const offeredCourseSchema = require('../models/offeredCourseModel');
const registeredCourseSchema = require('../models/registeredCourseModel');

const registerCourse = async (req, res) => {
  try {
    const { title, creditHours, fee, type, code, adminId } = req.body;

    // validation
    switch (true) {
      case !title:
        return res.status(400).send({
          success: false,
          message: 'Title is mandatory!',
        });
      case !fee:
        return res.status(400).send({
          success: false,
          message: 'Fee is mandatory!',
        });
      case !type:
        return res.status(400).send({
          success: false,
          message: 'Type is mandatory!',
        });
      case !code:
        return res.status(400).send({
          success: false,
          message: 'Code is mandatory!',
        });
      case !adminId:
        return res.status(400).send({
          success: false,
          message: 'Admin ID is mandatory!',
        });
      default:
        break;
    }

    // ensuring uniqueness
    const courseExists = await courseSchema.find({ title, code });
    if (courseExists.length) {
      return res.status(400).send({
        success: false,
        message: 'This course already exists.',
      });
    }

    // registration
    const newCourse = new courseSchema({
      title,
      creditHours: creditHours ? creditHours : 1,
      fee,
      type,
      code,
      adminId,
    });
    const result = await newCourse.save();

    if (result) {
      res.status(200).send({
        success: true,
        message: 'Course registered successfully!',
        data: newCourse,
      });
    } else {
      res.status(500).send({
        success: false,
        message: 'Something went wrong while registering the course.',
        error,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while registering the course.',
      error,
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await courseSchema.find();
    if (courses.length) {
      res.status(200).send({
        success: true,
        message: 'Courses fetched successfully!',
        count: courses.length,
        data: courses,
      });
    } else {
      res.status(204).send({
        success: true,
        message: 'No courses so far.',
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
    const { title, creditHours, fee, type, code } = req.body;

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
      case !fee:
        return res.status(400).send({
          success: false,
          message: 'Fee cannot be empty!',
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
        fee,
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
          registeredCoursesDetail.push({
            ...course._doc,
            requestId: element._id,
            status: element.status || "approved",
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

const registerRegisteredCourse = async (req, res) => {
  try {
    const { courseId, instructorId, studentId } = req.body;

    // validation
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
      case !studentId:
        return res.status(400).send({
          success: false,
          message: 'Student ID is mandatory!',
        });
      default:
        break;
    }

    // ensuring course's, instructor's and student's existence
    const courseExists = await courseSchema.findById(courseId);
    const instructorExists = await instructorSchema.findById(instructorId);
    const studentExists = await studentSchema.findById(studentId);
    if (!instructorExists && !courseExists && !studentExists) {
      return res.status(400).send({
        success: false,
        message: 'This course, instructor and student do not exist.',
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
    if (!studentExists) {
      return res.status(400).send({
        success: false,
        message: 'This student does not exist.',
      });
    }

    // ensuring uniqueness
    const registeredCourseExists = await registeredCourseSchema.find({
      courseId,
      studentId,
    });
    if (registeredCourseExists.length) {
      return res.status(400).send({
        success: false,
        message: 'This student has already registered this course.',
      });
    }

    // registration
    const newRegisteredCourse = new registeredCourseSchema({
      courseId,
      instructorId,
      studentId,
    });
    const result = await newRegisteredCourse.save();

    if (result) {
      res.status(200).send({
        success: true,
        message: 'Course registered successfully!',
        data: newRegisteredCourse,
      });
    } else {
      res.status(500).send({
        success: false,
        message: 'Something went wrong while offering the course.',
        error,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something went wrong while offering the course.',
      error,
    });
  }
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
        detail.push({
          ...item._doc,
          courseTitle: course.title,
          courseCode: course.code,
          instructorName: instructor.fname + ' ' + instructor.lname,
          instructorEmail: instructor.email,
          assignedAt: item.reviewedAt || item.createdAt,
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
