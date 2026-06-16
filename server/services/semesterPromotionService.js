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
  evaluateCoursePass,
  canPromoteAfterSemester,
  STUDENT_STATUS,
  SEMESTER_RESULT,
  TOTAL_SEMESTERS,
} = require('../utils/academicRules');
const { countStudentAbsences } = require('./attendanceService');
const {
  assignSemesterCourses,
  assignFailedCourseRepeats,
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

async function evaluateStudentCourseResults(studentId, programId, semesterNumber) {
  const enrollments = await registeredCourseSchema.find({
    studentId,
    programId,
    semesterNumber,
  });

  const evaluated = [];

  for (const enrollment of enrollments) {
    const existing = await courseResultSchema.findOne({
      studentId,
      courseId: enrollment.courseId,
      semesterNumber,
    });

    if (!existing) continue;

    const absences = await countStudentAbsences(studentId, enrollment.courseId, semesterNumber);
    const evaluation = evaluateCoursePass(
      existing.midExamMarks,
      existing.finalExamMarks,
      absences
    );

    const updated = await courseResultSchema.findByIdAndUpdate(
      existing._id,
      {
        midExamMarks: evaluation.midExamMarks,
        finalExamMarks: evaluation.finalExamMarks,
        totalMarks: evaluation.totalMarks,
        passFailStatus: evaluation.passFailStatus,
        absenceCount: evaluation.absenceCount,
        failReason: evaluation.failReason,
      },
      { new: true }
    );

    evaluated.push(updated);
  }

  return evaluated;
}

async function calculateSemesterResult(studentId, programId, semesterNumber) {
  const semester = await semesterSchema.findOne({ programId, semesterNumber });
  if (!semester) return null;

  const courses = await courseSchema.find({ semesterId: semester._id.toString() });
  const courseIds = courses.map((c) => c._id.toString());

  const enrolled = await registeredCourseSchema.find({
    studentId,
    programId,
    semesterNumber,
  });

  const enrolledCourseIds = enrolled.map((e) => e.courseId);
  const requiredCount = enrolled.length || courseIds.length;

  const results = await courseResultSchema.find({
    studentId,
    programId,
    semesterNumber,
    courseId: { $in: enrolledCourseIds.length ? enrolledCourseIds : courseIds },
  });

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
  const students = await studentAcademicRecordSchema.find({
    programId,
    currentSemester: semesterNumber,
  });

  const updates = [];
  for (const record of students) {
    await evaluateStudentCourseResults(record.studentId, programId, semesterNumber);

    const { semesterResult, hasAllResults } = await calculateSemesterResult(
      record.studentId,
      programId,
      semesterNumber
    );

    if (!hasAllResults) continue;

    await courseResultSchema.updateMany(
      { studentId: record.studentId, programId, semesterNumber },
      { isPublished: true }
    );

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
    } else if (semesterResult.result === SEMESTER_RESULT.COMPLETED_WITH_REPEATS) {
      if (semesterNumber >= TOTAL_SEMESTERS) {
        await studentAcademicRecordSchema.findByIdAndUpdate(record._id, {
          status: STUDENT_STATUS.ACTIVE,
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
    isPublished: true,
  });

  if (!canPromoteAfterSemester(lastSemesterResult)) {
    return {
      success: false,
      message: 'Previous semester results must be published before promotion.',
    };
  }

  const previousSemester = record.currentSemester;

  await studentAcademicRecordSchema.findByIdAndUpdate(record._id, {
    currentSemester: nextSemester,
    status: STUDENT_STATUS.ACTIVE,
  });

  const assignment = await assignSemesterCourses(studentId, record.programId, nextSemester);
  const repeats = await assignFailedCourseRepeats(
    studentId,
    record.programId,
    previousSemester,
    nextSemester
  );

  const repeatCount = repeats.assigned?.length ?? 0;
  const message =
    repeatCount > 0
      ? `Promoted to semester ${nextSemester}. ${repeatCount} failed course(s) added for repeat study.`
      : `Promoted to semester ${nextSemester}.`;

  return {
    success: true,
    message,
    currentSemester: nextSemester,
    assignment,
    repeats,
  };
}

async function handleFailedSemester(studentId, programId, semesterNumber) {
  await studentAcademicRecordSchema.findOneAndUpdate(
    { studentId },
    { status: STUDENT_STATUS.ACTIVE, currentSemester: semesterNumber }
  );
  return assignFailedCourseRepeats(studentId, programId, semesterNumber, semesterNumber);
}

module.exports = {
  upsertCourseResult,
  evaluateStudentCourseResults,
  calculateSemesterResult,
  publishSemesterResults,
  openSemesterRegistration,
  closeSemesterRegistration,
  confirmStudentPromotion,
  handleFailedSemester,
};
