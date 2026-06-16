const courseSchema = require('../models/courseModel');
const studentSchema = require('../models/studentModel');
const registeredCourseSchema = require('../models/registeredCourseModel');
const semesterSchema = require('../models/semesterModel');
const programSchema = require('../models/programModel');
const { assignSemesterCourses } = require('./studentEnrollmentService');
const { normalizeId, normalizeSemester, idsMatch, semestersMatch } = require('../utils/enrollmentHelpers');

async function getCourseSemesterContext(course) {
  if (!course?.semesterId) return null;
  const semester = await semesterSchema.findById(course.semesterId);
  if (!semester) return null;
  const program = await programSchema.findById(semester.programId);
  return {
    semesterId: semester._id.toString(),
    semesterNumber: semester.semesterNumber,
    semesterTitle: semester.title,
    programId: normalizeId(semester.programId),
    programName: program?.name ?? '',
  };
}

async function enrichEnrollmentRecord(enrollment) {
  const course = await courseSchema.findById(enrollment.courseId);
  if (!course?.semesterId) return null;

  const ctx = await getCourseSemesterContext(course);
  if (!ctx) return null;

  const updates = {};
  if (!normalizeId(enrollment.programId)) updates.programId = ctx.programId;
  if (enrollment.semesterNumber == null) updates.semesterNumber = ctx.semesterNumber;
  if (Object.keys(updates).length) {
    await registeredCourseSchema.findByIdAndUpdate(enrollment._id, updates);
    Object.assign(enrollment, updates);
  }

  return { enrollment, course, ctx };
}

async function collectStudentSemesterRows(studentId, programId, semesterNumber) {
  const pid = normalizeId(programId);
  const sem = normalizeSemester(semesterNumber);
  const enrollments = await registeredCourseSchema.find({ studentId });
  const rows = [];

  for (const enrollment of enrollments) {
    const meta = await enrichEnrollmentRecord(enrollment);
    if (!meta) continue;
    if (idsMatch(meta.ctx.programId, pid) && semestersMatch(meta.ctx.semesterNumber, sem)) {
      rows.push(meta);
    }
  }

  return rows;
}

async function getStudentSemesterEnrollments(studentId, programId, semesterNumber, { syncIfEmpty = true } = {}) {
  const pid = normalizeId(programId);
  const sem = normalizeSemester(semesterNumber);

  let rows = await collectStudentSemesterRows(studentId, pid, sem);

  if (!rows.length && syncIfEmpty) {
    await assignSemesterCourses(studentId, pid, sem);
    rows = await collectStudentSemesterRows(studentId, pid, sem);
  }

  return rows;
}

async function getInstructorSemesterStudents(instructorId) {
  const iid = normalizeId(instructorId);
  const enrollments = await registeredCourseSchema.find({ instructorId: iid });
  const seen = new Set();
  const rows = [];

  for (const enrollment of enrollments) {
    const meta = await enrichEnrollmentRecord(enrollment);
    if (!meta) continue;

    const student = await studentSchema.findById(enrollment.studentId);
    if (!student) continue;

    const key = `${normalizeId(enrollment.studentId)}:${normalizeId(enrollment.courseId)}:${meta.ctx.semesterNumber}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      student,
      course: meta.course,
      ctx: meta.ctx,
      enrollment: meta.enrollment,
    });
  }

  return rows;
}

module.exports = {
  normalizeId,
  normalizeSemester,
  idsMatch,
  semestersMatch,
  getCourseSemesterContext,
  enrichEnrollmentRecord,
  getStudentSemesterEnrollments,
  getInstructorSemesterStudents,
};
