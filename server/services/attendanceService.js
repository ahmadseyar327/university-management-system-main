const attendanceSchema = require('../models/attendanceModel');
const registeredCourseSchema = require('../models/registeredCourseModel');
const { ATTENDANCE_TOTAL_DAYS } = require('../utils/academicRules');

function isAbsentStatus(status) {
  const s = String(status ?? '').trim().toUpperCase();
  return s === 'A' || s === 'ABSENT' || s.startsWith('A');
}

async function resolveSemesterNumberForCourse(courseId, instructorId) {
  const enrollments = await registeredCourseSchema.find({ courseId, instructorId });
  if (!enrollments.length) return null;
  return Math.max(...enrollments.map((e) => Number(e.semesterNumber) || 1));
}

async function countAttendanceSessions(courseId, instructorId, semesterNumber) {
  const query = { courseId, instructorId };
  if (semesterNumber != null) {
    query.semesterNumber = semesterNumber;
  }
  return attendanceSchema.countDocuments(query);
}

async function countStudentAbsences(studentId, courseId, semesterNumber) {
  const query = { courseId };
  if (semesterNumber != null) {
    query.semesterNumber = semesterNumber;
  }

  const records = await attendanceSchema.find(query);
  let absences = 0;

  for (const record of records) {
    const entry = record.attendance?.find((a) => a.studentId === studentId);
    if (entry && isAbsentStatus(entry.status)) {
      absences += 1;
    }
  }

  return absences;
}

async function validateNewAttendanceSession({ courseId, instructorId, date, semesterNumber }) {
  const resolvedSemester =
    semesterNumber ?? (await resolveSemesterNumberForCourse(courseId, instructorId));

  const sessionCount = await countAttendanceSessions(courseId, instructorId, resolvedSemester);
  if (sessionCount >= ATTENDANCE_TOTAL_DAYS) {
    return {
      ok: false,
      message: `Maximum ${ATTENDANCE_TOTAL_DAYS} attendance sessions allowed for this course.`,
      semesterNumber: resolvedSemester,
    };
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const duplicate = await attendanceSchema.findOne({
    courseId,
    instructorId,
    semesterNumber: resolvedSemester,
    date: { $gte: dayStart, $lte: dayEnd },
  });

  if (duplicate) {
    return {
      ok: false,
      message: 'Attendance for this date already exists. Use edit to update it.',
      semesterNumber: resolvedSemester,
    };
  }

  return {
    ok: true,
    semesterNumber: resolvedSemester,
    sessionCount,
    sessionsRemaining: ATTENDANCE_TOTAL_DAYS - sessionCount,
  };
}

module.exports = {
  isAbsentStatus,
  resolveSemesterNumberForCourse,
  countAttendanceSessions,
  countStudentAbsences,
  validateNewAttendanceSession,
};
