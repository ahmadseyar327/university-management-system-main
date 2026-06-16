const courseSchema = require('../models/courseModel');
const offeredCourseSchema = require('../models/offeredCourseModel');
const programSchema = require('../models/programModel');
const registeredCourseSchema = require('../models/registeredCourseModel');
const semesterSchema = require('../models/semesterModel');
const studentAcademicRecordSchema = require('../models/studentAcademicRecordModel');
const { STUDENT_STATUS, TOTAL_SEMESTERS } = require('../utils/academicRules');

async function getEnrollmentBlockMessage(existing, requestedProgramId) {
  const enrolledProgram = await programSchema.findById(existing.programId);
  const programName = enrolledProgram?.name ?? 'a program';
  if (existing.programId === requestedProgramId) {
    return `You are already enrolled in ${programName}.`;
  }
  return `You can only enroll in one program. You are already enrolled in ${programName}.`;
}

async function getSemesterCourses(programId, semesterNumber) {
  const semester = await semesterSchema.findOne({ programId, semesterNumber });
  if (!semester) return { semester: null, courses: [] };

  const courses = await courseSchema.find({ semesterId: semester._id.toString() });
  return { semester, courses };
}

async function findApprovedInstructor(courseId) {
  const offer = await offeredCourseSchema.findOne({
    courseId,
    status: 'approved',
  });
  return offer?.instructorId || null;
}

async function assignSemesterCourses(studentId, programId, semesterNumber) {
  const record = await studentAcademicRecordSchema.findOne({ studentId });
  if (!record || record.programId !== programId) {
    return { assigned: [], skipped: [], message: 'Student is not enrolled in this program.' };
  }

  const { semester, courses } = await getSemesterCourses(programId, semesterNumber);
  if (!semester) {
    return { assigned: [], skipped: [], message: 'Semester not found.' };
  }

  const assigned = [];
  const skipped = [];

  for (const course of courses) {
    const courseId = course._id.toString();
    const instructorId = await findApprovedInstructor(courseId);

    if (!instructorId) {
      skipped.push({ courseId, title: course.title, reason: 'No approved instructor' });
      continue;
    }

    const exists = await registeredCourseSchema.findOne({ studentId, courseId, semesterNumber });
    if (exists) {
      skipped.push({ courseId, title: course.title, reason: 'Already enrolled this semester' });
      continue;
    }

    await registeredCourseSchema.create({
      studentId,
      courseId,
      instructorId,
      programId,
      semesterNumber,
      enrollmentType: 'semester_auto',
    });
    assigned.push({ courseId, title: course.title, instructorId });
  }

  return { assigned, skipped, semesterNumber, programId };
}

async function enrollStudentInProgram(studentId, programId) {
  const existing = await studentAcademicRecordSchema.findOne({ studentId });
  if (existing) {
    const message = await getEnrollmentBlockMessage(existing, programId);
    return { success: false, message, record: existing };
  }

  let record;
  try {
    record = await studentAcademicRecordSchema.create({
      studentId,
      programId,
      currentSemester: 1,
      enrollmentDate: new Date(),
      status: STUDENT_STATUS.ACTIVE,
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicate = await studentAcademicRecordSchema.findOne({ studentId });
      const message = duplicate
        ? await getEnrollmentBlockMessage(duplicate, programId)
        : 'You can only enroll in one program.';
      return { success: false, message, record: duplicate };
    }
    throw error;
  }

  const assignment = await assignSemesterCourses(studentId, programId, 1);

  return {
    success: true,
    message: 'Enrolled in program. Semester 1 courses assigned where instructors are available.',
    record,
    assignment,
  };
}

async function repeatSemesterCourses(studentId, programId, semesterNumber) {
  await registeredCourseSchema.deleteMany({
    studentId,
    programId,
    semesterNumber,
    enrollmentType: { $in: ['semester_auto', 'repeat'] },
  });
  return assignSemesterCourses(studentId, programId, semesterNumber);
}

async function assignFailedCourseRepeats(studentId, programId, fromSemester, toSemester) {
  const courseResultSchema = require('../models/courseResultModel');
  const { PASS_FAIL } = require('../utils/academicRules');

  const failedResults = await courseResultSchema.find({
    studentId,
    programId,
    semesterNumber: fromSemester,
    isPublished: true,
    passFailStatus: PASS_FAIL.FAIL,
  });

  const assigned = [];
  const skipped = [];

  for (const result of failedResults) {
    const courseId = result.courseId;
    const instructorId = await findApprovedInstructor(courseId);

    if (!instructorId) {
      skipped.push({ courseId, reason: 'No approved instructor for repeat course' });
      continue;
    }

    const exists = await registeredCourseSchema.findOne({
      studentId,
      courseId,
      semesterNumber: toSemester,
    });

    if (exists) {
      skipped.push({ courseId, reason: 'Repeat already scheduled' });
      continue;
    }

    const course = await courseSchema.findById(courseId);
    await registeredCourseSchema.create({
      studentId,
      courseId,
      instructorId,
      programId,
      semesterNumber: toSemester,
      enrollmentType: 'repeat',
      repeatFromSemester: fromSemester,
    });

    assigned.push({
      courseId,
      title: course?.title,
      instructorId,
      repeatFromSemester: fromSemester,
    });
  }

  return { assigned, skipped, fromSemester, toSemester };
}

module.exports = {
  getSemesterCourses,
  assignSemesterCourses,
  enrollStudentInProgram,
  repeatSemesterCourses,
  assignFailedCourseRepeats,
  TOTAL_SEMESTERS,
};
