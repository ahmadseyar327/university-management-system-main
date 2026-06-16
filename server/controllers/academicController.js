const studentAcademicRecordSchema = require('../models/studentAcademicRecordModel');
const courseResultSchema = require('../models/courseResultModel');
const semesterResultSchema = require('../models/semesterResultModel');
const semesterRegistrationSchema = require('../models/semesterRegistrationModel');
const registeredCourseSchema = require('../models/registeredCourseModel');
const courseSchema = require('../models/courseModel');
const semesterSchema = require('../models/semesterModel');
const programSchema = require('../models/programModel');
const studentSchema = require('../models/studentModel');
const { enrollStudentInProgram } = require('../services/studentEnrollmentService');
const {
  upsertCourseResult,
  calculateSemesterResult,
  publishSemesterResults,
  openSemesterRegistration,
  closeSemesterRegistration,
  confirmStudentPromotion,
  handleFailedSemester,
} = require('../services/semesterPromotionService');
const { SEMESTER_RESULT, ATTENDANCE_TOTAL_DAYS, MAX_ABSENCES_BEFORE_FAIL } = require('../utils/academicRules');
const { countStudentAbsences } = require('../services/attendanceService');

const enrollInProgram = async (req, res) => {
  try {
    const { studentId, programId } = req.body;
    if (!studentId || !programId) {
      return res.status(400).send({ success: false, message: 'studentId and programId are required.' });
    }
    const student = await studentSchema.findById(studentId);
    const program = await programSchema.findById(programId);
    if (!student || !program) {
      return res.status(404).send({ success: false, message: 'Student or program not found.' });
    }
    const result = await enrollStudentInProgram(studentId, programId);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ success: false, message: 'Enrollment failed.', error });
  }
};

const getStudentAcademicRecord = async (req, res) => {
  try {
    const record = await studentAcademicRecordSchema.findOne({ studentId: req.params.studentId });
    if (!record) {
      return res.status(404).send({ success: false, message: 'No academic record found.' });
    }
    const program = await programSchema.findById(record.programId);
    res.status(200).send({
      success: true,
      data: {
        ...record._doc,
        programName: program?.name,
      },
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not fetch record.', error });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const record = await studentAcademicRecordSchema.findOne({ studentId });
    if (!record) {
      return res.status(404).send({ success: false, message: 'Not enrolled in a program.' });
    }

    const program = await programSchema.findById(record.programId);
    const semester = await semesterSchema.findOne({
      programId: record.programId,
      semesterNumber: record.currentSemester,
    });

    const enrollments = await registeredCourseSchema.find({
      studentId,
      programId: record.programId,
      semesterNumber: record.currentSemester,
    });

    const courseIds = enrollments.map((e) => e.courseId);
    const courses = await courseSchema.find({ _id: { $in: courseIds } });

    const courseResults = await courseResultSchema.find({
      studentId,
      semesterNumber: record.currentSemester,
      ...(record.status === 'Active' ? {} : { isPublished: true }),
    });

    const semesterResult = await semesterResultSchema.findOne({
      studentId,
      programId: record.programId,
      semesterNumber: record.currentSemester,
    });

    const nextReg = await semesterRegistrationSchema.findOne({
      programId: record.programId,
      targetSemester: record.currentSemester + 1,
      isOpen: true,
    });

    res.status(200).send({
      success: true,
      data: {
        program: program ? { id: program._id, name: program.name } : null,
        currentSemester: record.currentSemester,
        semesterTitle: semester?.title,
        status: record.status,
        enrollmentDate: record.enrollmentDate,
        courses: enrollments.map((enrollment) => {
          const course = courses.find((c) => c._id.toString() === enrollment.courseId);
          if (!course) return null;
          return {
            id: course._id,
            name: course.title,
            code: course.code,
            description: course.description,
            isRepeat: enrollment.enrollmentType === 'repeat',
            repeatFromSemester: enrollment.repeatFromSemester ?? null,
          };
        }).filter(Boolean),
        results: courseResults,
        semesterResult,
        registrationOpen: Boolean(nextReg),
        promotionStatus: semesterResult?.isPublished
          ? semesterResult.result
          : SEMESTER_RESULT.PENDING,
      },
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not load dashboard.', error });
  }
};

const saveCourseResult = async (req, res) => {
  try {
    const { studentId, courseId, instructorId, programId, semesterNumber, midExamMarks, finalExamMarks } =
      req.body;

    if (!studentId || !courseId || !instructorId || !programId || !semesterNumber) {
      return res.status(400).send({ success: false, message: 'Missing required fields.' });
    }

    const result = await upsertCourseResult({
      studentId,
      courseId,
      instructorId,
      programId,
      semesterNumber: Number(semesterNumber),
      midExamMarks,
      finalExamMarks,
    });

    res.status(200).send({ success: true, message: 'Marks saved.', data: result });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not save marks.', error });
  }
};

const getCourseResultsForInstructor = async (req, res) => {
  try {
    const { instructorId, courseId, semesterNumber } = req.query;
    const enrollments = await registeredCourseSchema.find({
      instructorId,
      courseId,
      semesterNumber: Number(semesterNumber),
    });

    const results = await courseResultSchema.find({
      courseId,
      semesterNumber: Number(semesterNumber),
      studentId: { $in: enrollments.map((e) => e.studentId) },
    });

    const students = await studentSchema.find({
      _id: { $in: enrollments.map((e) => e.studentId) },
    });

    const merged = enrollments.map((e) => {
      const student = students.find((s) => s._id.toString() === e.studentId);
      const result = results.find((r) => r.studentId === e.studentId);
      return {
        studentId: e.studentId,
        rollNumber: student?.rollNumber,
        name: student ? `${student.fname} ${student.lname}` : '',
        midExamMarks: result?.midExamMarks ?? 0,
        finalExamMarks: result?.finalExamMarks ?? 0,
        totalMarks: result?.totalMarks ?? 0,
        passFailStatus: result?.passFailStatus,
        resultId: result?._id,
      };
    });

    res.status(200).send({ success: true, data: merged });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not load results.', error });
  }
};

const adminPublishSemester = async (req, res) => {
  try {
    const { adminId, programId, semesterNumber } = req.body;
    const updates = await publishSemesterResults(adminId, programId, Number(semesterNumber));
    res.status(200).send({
      success: true,
      message: 'Semester results published.',
      data: updates,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Publish failed.', error });
  }
};

const adminOpenRegistration = async (req, res) => {
  try {
    const { adminId, programId, targetSemester } = req.body;
    const reg = await openSemesterRegistration(adminId, programId, Number(targetSemester));
    res.status(200).send({ success: true, message: 'Registration opened.', data: reg });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not open registration.', error });
  }
};

const adminCloseRegistration = async (req, res) => {
  try {
    const { programId, targetSemester } = req.body;
    const reg = await closeSemesterRegistration(programId, Number(targetSemester));
    res.status(200).send({ success: true, message: 'Registration closed.', data: reg });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not close registration.', error });
  }
};

const confirmPromotion = async (req, res) => {
  try {
    const { studentId } = req.body;
    const result = await confirmStudentPromotion(studentId);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ success: false, message: 'Promotion failed.', error });
  }
};

const adminListEligibleStudents = async (req, res) => {
  try {
    const { programId, semesterNumber } = req.query;
    const records = await studentAcademicRecordSchema.find({
      programId,
      currentSemester: Number(semesterNumber),
      status: 'Ready For Registration',
    });

    const studentIds = records.map((r) => r.studentId);
    const students = await studentSchema.find({ _id: { $in: studentIds } });

    const merged = records.map((record) => {
      const student = students.find((s) => s._id.toString() === record.studentId);
      return {
        ...record._doc,
        rollNumber: student?.rollNumber,
        name: student ? `${student.fname} ${student.lname}` : '',
        email: student?.email,
      };
    });

    res.status(200).send({ success: true, data: merged });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not list students.', error });
  }
};

const studentConfirmPromotion = async (req, res) => {
  try {
    const { studentId } = req.body;
    const result = await confirmStudentPromotion(studentId);
    if (!result.success) {
      return res.status(400).send(result);
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ success: false, message: 'Promotion failed.', error });
  }
};

const getRegistrationStatus = async (req, res) => {
  try {
    const { programId, targetSemester } = req.query;
    if (!programId || !targetSemester) {
      return res.status(400).send({ success: false, message: 'programId and targetSemester are required.' });
    }
    const reg = await semesterRegistrationSchema.findOne({
      programId,
      targetSemester: Number(targetSemester),
    });
    res.status(200).send({
      success: true,
      data: reg || { programId, targetSemester: Number(targetSemester), isOpen: false },
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not fetch registration status.', error });
  }
};

const getSemesterHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const record = await studentAcademicRecordSchema.findOne({ studentId });
    if (!record) {
      return res.status(404).send({ success: false, message: 'No academic record found.' });
    }

    const { programId, currentSemester } = record;

    const [program, semesterDefs, semesterResults, allCourseResults, allEnrollments] =
      await Promise.all([
        programSchema.findById(programId),
        semesterSchema.find({ programId }).sort({ semesterNumber: 1 }),
        semesterResultSchema.find({ studentId, programId }),
        courseResultSchema.find({ studentId, programId }),
        registeredCourseSchema.find({ studentId, programId }),
      ]);

    const courseIds = [...new Set(allEnrollments.map((e) => e.courseId))];
    const courses = await courseSchema.find({ _id: { $in: courseIds } });
    const courseById = Object.fromEntries(courses.map((c) => [c._id.toString(), c]));

    const semesters = [];
    for (let sem = 1; sem <= currentSemester; sem += 1) {
      const semDef = semesterDefs.find((s) => s.semesterNumber === sem);
      const semResult = semesterResults.find((sr) => sr.semesterNumber === sem);
      const isOngoing = sem === currentSemester;

      const enrollments = allEnrollments.filter((e) => e.semesterNumber === sem);
      const courseResultsForSem = allCourseResults.filter((cr) => cr.semesterNumber === sem);

      const coursesData = [];
      for (const enrollment of enrollments) {
        const course = courseById[enrollment.courseId];
        if (!course) continue;

        const result = courseResultsForSem.find((r) => r.courseId === enrollment.courseId);
        const liveAbsences = await countStudentAbsences(studentId, enrollment.courseId, sem);
        const absenceCount = result?.absenceCount ?? liveAbsences;

        if (!isOngoing && result && !result.isPublished) {
          coursesData.push({
            courseId: course._id.toString(),
            name: course.title,
            code: course.code,
            isRepeat: enrollment.enrollmentType === 'repeat',
            midExamMarks: null,
            finalExamMarks: null,
            totalMarks: null,
            passFailStatus: null,
            absenceCount,
            failReason: null,
            markStatus: 'Pending',
          });
          continue;
        }

        if (!result) {
          coursesData.push({
            courseId: course._id.toString(),
            name: course.title,
            code: course.code,
            isRepeat: enrollment.enrollmentType === 'repeat',
            midExamMarks: null,
            finalExamMarks: null,
            totalMarks: null,
            passFailStatus: null,
            absenceCount,
            failReason: null,
            markStatus: 'Pending',
          });
          continue;
        }

        coursesData.push({
          courseId: course._id.toString(),
          name: course.title,
          code: course.code,
          isRepeat: enrollment.enrollmentType === 'repeat',
          midExamMarks: result.midExamMarks,
          finalExamMarks: result.finalExamMarks,
          totalMarks: result.totalMarks,
          passFailStatus: result.passFailStatus,
          absenceCount,
          failReason: result.failReason ?? null,
          markStatus: result.isPublished ? 'Published' : 'Unpublished',
        });
      }

      coursesData.sort((a, b) => a.code.localeCompare(b.code));

      let statusLabel = 'Ongoing';
      if (!isOngoing) {
        if (semResult?.isPublished) {
          statusLabel = semResult.result;
        } else {
          statusLabel = 'Completed';
        }
      }

      semesters.push({
        semesterNumber: sem,
        semesterTitle: semDef?.title ?? `Semester ${sem}`,
        isOngoing,
        statusLabel,
        semesterResult: semResult,
        courses: coursesData,
      });
    }

    const ongoingSemester = semesters.find((s) => s.isOngoing) ?? null;
    const historySemesters = semesters.filter((s) => !s.isOngoing);

    res.status(200).send({
      success: true,
      data: {
        program: program ? { id: program._id, name: program.name } : null,
        currentSemester,
        status: record.status,
        ongoingSemester,
        historySemesters,
        semesters,
        attendanceRules: {
          totalSessions: ATTENDANCE_TOTAL_DAYS,
          maxAbsences: MAX_ABSENCES_BEFORE_FAIL,
        },
      },
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not load history.', error });
  }
};

const retryFailedSemester = async (req, res) => {
  try {
    const { studentId, programId, semesterNumber } = req.body;
    if (!studentId || !programId || !semesterNumber) {
      return res.status(400).send({ success: false, message: 'studentId, programId, and semesterNumber are required.' });
    }
    const assignment = await handleFailedSemester(studentId, programId, Number(semesterNumber));
    res.status(200).send({
      success: true,
      message: 'Failed courses re-assigned for repeat study.',
      assignment,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Retry failed.', error });
  }
};

const recalculateSemester = async (req, res) => {
  try {
    const { studentId, programId, semesterNumber } = req.body;
    const data = await calculateSemesterResult(studentId, programId, Number(semesterNumber));
    res.status(200).send({ success: true, data });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Calculation failed.', error });
  }
};

const updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const record = await studentAcademicRecordSchema.findOneAndUpdate(
      { studentId: req.params.studentId },
      { status },
      { new: true }
    );
    if (!record) {
      return res.status(404).send({ success: false, message: 'Record not found.' });
    }
    res.status(200).send({ success: true, data: record });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Update failed.', error });
  }
};

module.exports = {
  enrollInProgram,
  getStudentAcademicRecord,
  getStudentDashboard,
  saveCourseResult,
  getCourseResultsForInstructor,
  adminPublishSemester,
  adminOpenRegistration,
  adminCloseRegistration,
  confirmPromotion,
  adminListEligibleStudents,
  recalculateSemester,
  updateStudentStatus,
  studentConfirmPromotion,
  getRegistrationStatus,
  getSemesterHistory,
  retryFailedSemester,
};
