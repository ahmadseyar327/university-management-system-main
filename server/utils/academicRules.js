const PASSING_TOTAL = 55;
const MID_EXAM_MAX = 20;
const FINAL_EXAM_MAX = 80;
const TOTAL_MAX = 100;
const TOTAL_SEMESTERS = 8;

const STUDENT_STATUS = {
  ACTIVE: 'Active',
  READY_FOR_REGISTRATION: 'Ready For Registration',
  GRADUATED: 'Graduated',
  SUSPENDED: 'Suspended',
};

const SEMESTER_RESULT = {
  PASSED: 'PASSED SEMESTER',
  FAILED: 'FAILED SEMESTER',
  PENDING: 'PENDING',
};

const PASS_FAIL = {
  PASS: 'PASS',
  FAIL: 'FAIL',
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

function computeSemesterResult(courseResults) {
  if (!courseResults?.length) return SEMESTER_RESULT.PENDING;
  const allPass = courseResults.every((r) => r.passFailStatus === PASS_FAIL.PASS);
  return allPass ? SEMESTER_RESULT.PASSED : SEMESTER_RESULT.FAILED;
}

module.exports = {
  PASSING_TOTAL,
  MID_EXAM_MAX,
  FINAL_EXAM_MAX,
  TOTAL_MAX,
  TOTAL_SEMESTERS,
  STUDENT_STATUS,
  SEMESTER_RESULT,
  PASS_FAIL,
  computeCourseResult,
  computeSemesterResult,
};
