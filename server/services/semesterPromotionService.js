const courseResultSchema = require('../models/courseResultModel');
const semesterResultSchema = require('../models/semesterResultModel');
const semesterRegistrationSchema = require('../models/semesterRegistrationModel');
const studentAcademicRecordSchema = require('../models/studentAcademicRecordModel');
const registeredCourseSchema = require('../models/registeredCourseModel');
const courseSchema = require('../models/courseModel');
const semesterSchema = require('../models/semesterModel');
const {
  computeCourseResult,
  computeSemesterResult,
  STUDENT_STATUS,
  SEMESTER_RESULT,
  TOTAL_SEMESTERS,
} = require('../utils/academicRules');
const {
  assignSemesterCourses,
  repeatSemesterCourses,
} = require('./studentEnrollmentService');

async function upsertCourseResult(payload) {
  const computed = computeCourseResult(payload.midExamMarks, payload.finalExamMarks);
  const data = {
    ...payload,
    ...computed,
  };

  const result = await courseResultSchema.findOneAndUpdate(
    {
      studentId: data.studentId,
      courseId: data.courseId,
      semesterNumber: data.semesterNumber,
    },
    data,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return result;
}

async function calculateSemesterResult(studentId, programId, semesterNumber) {
  const semester = await semesterSchema.findOne({ programId, semesterNumber });
  if (!semester) return null;

  const courses = await courseSchema.find({ semesterId: semester._id.toString() });
  const courseIds = courses.map((c) => c._id.toString());

  const results = await courseResultSchema.find({
    studentId,
    programId,
    semesterNumber,
    courseId: { $in: courseIds },
  });

  const enrolled = await registeredCourseSchema.find({
    studentId,
    programId,
    semesterNumber,
  });

  const requiredCount = enrolled.length || courseIds.length;
  const hasAllResults = results.length >= requiredCount && requiredCount > 0;

  const semesterOutcome = hasAllResults
    ? computeSemesterResult(results)
    : SEMESTER_RESULT.PENDING;

  const doc = await semesterResultSchema.findOneAndUpdate(
    { studentId, programId, semesterNumber },
    { result: semesterOutcome },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { semesterResult: doc, courseResults: results, requiredCount, hasAllResults };
}

async function publishSemesterResults(adminId, programId, semesterNumber) {
  await courseResultSchema.updateMany(
    { programId, semesterNumber },
    { isPublished: true }
  );

  const students = await studentAcademicRecordSchema.find({
    programId,
    currentSemester: semesterNumber,
  });

  const updates = [];
  for (const record of students) {
    const { semesterResult, hasAllResults } = await calculateSemesterResult(
      record.studentId,
      programId,
      semesterNumber
    );

    if (!hasAllResults) continue;

    await semesterResultSchema.findByIdAndUpdate(semesterResult._id, {
      isPublished: true,
      publishedAt: new Date(),
      publishedByAdminId: adminId,
      reviewedByAdminId: adminId,
    });

    if (semesterResult.result === SEMESTER_RESULT.PASSED) {
      if (semesterNumber >= TOTAL_SEMESTERS) {
        await studentAcademicRecordSchema.findByIdAndUpdate(record._id, {
          status: STUDENT_STATUS.GRADUATED,
        });
      } else {
        await studentAcademicRecordSchema.findByIdAndUpdate(record._id, {
          status: STUDENT_STATUS.READY_FOR_REGISTRATION,
        });
      }
    }

    updates.push({
      studentId: record.studentId,
      result: semesterResult.result,
    });
  }

  return updates;
}

async function openSemesterRegistration(adminId, programId, targetSemester) {
  return semesterRegistrationSchema.findOneAndUpdate(
    { programId, targetSemester },
    {
      isOpen: true,
      openedAt: new Date(),
      closedAt: null,
      openedByAdminId: adminId,
    },
    { upsert: true, new: true }
  );
}

async function closeSemesterRegistration(programId, targetSemester) {
  return semesterRegistrationSchema.findOneAndUpdate(
    { programId, targetSemester },
    { isOpen: false, closedAt: new Date() },
    { new: true }
  );
}

async function confirmStudentPromotion(studentId) {
  const record = await studentAcademicRecordSchema.findOne({ studentId });
  if (!record) {
    return { success: false, message: 'No academic record found.' };
  }

  if (record.status !== STUDENT_STATUS.READY_FOR_REGISTRATION) {
    return {
      success: false,
      message: `Student status must be "${STUDENT_STATUS.READY_FOR_REGISTRATION}". Current: ${record.status}`,
    };
  }

  const nextSemester = record.currentSemester + 1;
  if (nextSemester > TOTAL_SEMESTERS) {
    return { success: false, message: 'Student has already completed all semesters.' };
  }

  const registration = await semesterRegistrationSchema.findOne({
    programId: record.programId,
    targetSemester: nextSemester,
    isOpen: true,
  });

  if (!registration) {
    return {
      success: false,
      message: `Registration for semester ${nextSemester} is not open.`,
    };
  }

  const lastSemesterResult = await semesterResultSchema.findOne({
    studentId,
    programId: record.programId,
    semesterNumber: record.currentSemester,
    result: SEMESTER_RESULT.PASSED,
    isPublished: true,
  });

  if (!lastSemesterResult) {
    return {
      success: false,
      message: 'Previous semester results must be published and passed.',
    };
  }

  await studentAcademicRecordSchema.findByIdAndUpdate(record._id, {
    currentSemester: nextSemester,
    status: STUDENT_STATUS.ACTIVE,
  });

  const assignment = await assignSemesterCourses(studentId, record.programId, nextSemester);

  return {
    success: true,
    message: `Promoted to semester ${nextSemester}.`,
    currentSemester: nextSemester,
    assignment,
  };
}

async function handleFailedSemester(studentId, programId, semesterNumber) {
  await studentAcademicRecordSchema.findOneAndUpdate(
    { studentId },
    { status: STUDENT_STATUS.ACTIVE, currentSemester: semesterNumber }
  );
  return repeatSemesterCourses(studentId, programId, semesterNumber);
}

module.exports = {
  upsertCourseResult,
  calculateSemesterResult,
  publishSemesterResults,
  openSemesterRegistration,
  closeSemesterRegistration,
  confirmStudentPromotion,
  handleFailedSemester,
};
