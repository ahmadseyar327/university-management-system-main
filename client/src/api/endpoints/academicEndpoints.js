const title = 'academic/';

export const academicEndpoints = {
  enrollInProgram: () => `${process.env.REACT_APP_API_URL}${title}enroll`,
  getStudentRecord: (studentId) => `${process.env.REACT_APP_API_URL}${title}record/${studentId}`,
  getStudentDashboard: (studentId) =>
    `${process.env.REACT_APP_API_URL}${title}dashboard/${studentId}`,
  getSemesterHistory: (studentId) =>
    `${process.env.REACT_APP_API_URL}${title}history/${studentId}`,

  saveCourseResult: () => `${process.env.REACT_APP_API_URL}${title}course-result`,
  getCourseResultsForInstructor: (instructorId, courseId, semesterNumber) =>
    `${process.env.REACT_APP_API_URL}${title}course-result/instructor?instructorId=${instructorId}&courseId=${courseId}&semesterNumber=${semesterNumber}`,

  studentConfirmPromotion: () => `${process.env.REACT_APP_API_URL}${title}promotion/confirm`,
  getRegistrationStatus: (programId, targetSemester) =>
    `${process.env.REACT_APP_API_URL}${title}registration/status?programId=${programId}&targetSemester=${targetSemester}`,

  adminPublishSemester: () => `${process.env.REACT_APP_API_URL}${title}admin/publish-semester`,
  adminOpenRegistration: () => `${process.env.REACT_APP_API_URL}${title}admin/open-registration`,
  adminCloseRegistration: () => `${process.env.REACT_APP_API_URL}${title}admin/close-registration`,
  adminEligibleStudents: (programId, semesterNumber) =>
    `${process.env.REACT_APP_API_URL}${title}admin/eligible-students?programId=${programId}&semesterNumber=${semesterNumber}`,
  adminConfirmPromotion: () => `${process.env.REACT_APP_API_URL}${title}admin/confirm-promotion`,
  adminRetryFailedSemester: () => `${process.env.REACT_APP_API_URL}${title}admin/retry-failed-semester`,
  recalculateSemester: () => `${process.env.REACT_APP_API_URL}${title}semester/recalculate`,
};
