const courseSchema = require('../models/courseModel');
const offeredCourseSchema = require('../models/offeredCourseModel');
const registeredCourseSchema = require('../models/registeredCourseModel');
const semesterSchema = require('../models/semesterModel');
const studentAcademicRecordSchema = require('../models/studentAcademicRecordModel');
const { STUDENT_STATUS, TOTAL_SEMESTERS } = require('../utils/academicRules');

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

    const exists = await registeredCourseSchema.findOne({ studentId, courseId });
    if (exists) {
      skipped.push({ courseId, title: course.title, reason: 'Already enrolled' });
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
    return { success: false, message: 'Student is already enrolled in a program.', record: existing };
  }

  const record = await studentAcademicRecordSchema.create({
    studentId,
    programId,
    currentSemester: 1,
    enrollmentDate: new Date(),
    status: STUDENT_STATUS.ACTIVE,
  });

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
    enrollmentType: 'semester_auto',
  });
  return assignSemesterCourses(studentId, programId, semesterNumber);
}

module.exports = {
  getSemesterCourses,
  assignSemesterCourses,
  enrollStudentInProgram,
  repeatSemesterCourses,
  TOTAL_SEMESTERS,
};
