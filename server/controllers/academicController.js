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
} = require('../services/semesterPromotionService');
const { SEMESTER_RESULT } = require('../utils/academicRules');

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
        courses: courses.map((c) => ({
          id: c._id,
          name: c.title,
          code: c.code,
          description: c.description,
        })),
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
    res.status(200).send({ success: true, data: records });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not list students.', error });
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
};
