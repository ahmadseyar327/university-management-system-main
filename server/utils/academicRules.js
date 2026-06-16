const PASSING_TOTAL = 55;
const MID_EXAM_MAX = 20;
const FINAL_EXAM_MAX = 80;
const TOTAL_MAX = 100;
const TOTAL_SEMESTERS = 8;
const ATTENDANCE_TOTAL_DAYS = 16;
const MAX_ABSENCES_BEFORE_FAIL = 6;

const STUDENT_STATUS = {
  ACTIVE: 'Active',
  READY_FOR_REGISTRATION: 'Ready For Registration',
  GRADUATED: 'Graduated',
  SUSPENDED: 'Suspended',
};

const SEMESTER_RESULT = {
  PASSED: 'PASSED SEMESTER',
  COMPLETED_WITH_REPEATS: 'COMPLETED WITH REPEATS',
  FAILED: 'FAILED SEMESTER',
  PENDING: 'PENDING',
};

const PASS_FAIL = {
  PASS: 'PASS',
  FAIL: 'FAIL',
};

const FAIL_REASON = {
  MARKS: 'marks',
  ATTENDANCE: 'attendance',
  BOTH: 'marks_and_attendance',
};

function clampMark(value, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(max, n));
}

function computeCourseResult(midExamMarks, finalExamMarks) {
  const mid = clampMark(midExamMarks, MID_EXAM_MAX);
  const fin = clampMark(finalExamMarks, FINAL_EXAM_MAX);
  const total = mid + fin;
  return {
    midExamMarks: mid,
    finalExamMarks: fin,
    totalMarks: total,
    passFailStatus: total >= PASSING_TOTAL ? PASS_FAIL.PASS : PASS_FAIL.FAIL,
  };
}

function evaluateCoursePass(midExamMarks, finalExamMarks, absenceCount = 0) {
  const marks = computeCourseResult(midExamMarks, finalExamMarks);
  const absences = Number(absenceCount) || 0;
  const failedAttendance = absences > MAX_ABSENCES_BEFORE_FAIL;
  const failedMarks = marks.passFailStatus === PASS_FAIL.FAIL;

  let failReason = null;
  if (failedMarks && failedAttendance) failReason = FAIL_REASON.BOTH;
  else if (failedMarks) failReason = FAIL_REASON.MARKS;
  else if (failedAttendance) failReason = FAIL_REASON.ATTENDANCE;

  return {
    ...marks,
    absenceCount: absences,
    failReason,
    passFailStatus: failedMarks || failedAttendance ? PASS_FAIL.FAIL : PASS_FAIL.PASS,
  };
}

function computeSemesterResult(courseResults) {
  if (!courseResults?.length) return SEMESTER_RESULT.PENDING;
  const allPass = courseResults.every((r) => r.passFailStatus === PASS_FAIL.PASS);
  return allPass ? SEMESTER_RESULT.PASSED : SEMESTER_RESULT.COMPLETED_WITH_REPEATS;
}

function canPromoteAfterSemester(semesterResult) {
  if (!semesterResult?.isPublished) return false;
  return (
    semesterResult.result === SEMESTER_RESULT.PASSED ||
    semesterResult.result === SEMESTER_RESULT.COMPLETED_WITH_REPEATS
  );
}

module.exports = {
  PASSING_TOTAL,
  MID_EXAM_MAX,
  FINAL_EXAM_MAX,
  TOTAL_MAX,
  TOTAL_SEMESTERS,
  ATTENDANCE_TOTAL_DAYS,
  MAX_ABSENCES_BEFORE_FAIL,
  STUDENT_STATUS,
  SEMESTER_RESULT,
  PASS_FAIL,
  FAIL_REASON,
  computeCourseResult,
  evaluateCoursePass,
  computeSemesterResult,
  canPromoteAfterSemester,
};
