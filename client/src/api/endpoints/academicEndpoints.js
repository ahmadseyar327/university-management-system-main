const title = "academic/";

export const academicEndpoints = {
  enrollInProgram: () => `${process.env.REACT_APP_API_URL}${title}enroll`,
  getStudentRecord: (studentId) => `${process.env.REACT_APP_API_URL}${title}record/${studentId}`,
  getStudentDashboard: (studentId) =>
    `${process.env.REACT_APP_API_URL}${title}dashboard/${studentId}`,

  saveCourseResult: () => `${process.env.REACT_APP_API_URL}${title}course-result`,
  getCourseResultsForInstructor: () =>
    `${process.env.REACT_APP_API_URL}${title}course-result/instructor`,

  adminPublishSemester: () => `${process.env.REACT_APP_API_URL}${title}admin/publish-semester`,
  adminOpenRegistration: () => `${process.env.REACT_APP_API_URL}${title}admin/open-registration`,
  adminCloseRegistration: () => `${process.env.REACT_APP_API_URL}${title}admin/close-registration`,
  adminEligibleStudents: (query) => {
    // query: ?programId=...&semesterNumber=...
    const base = `${process.env.REACT_APP_API_URL}${title}admin/eligible-students`;
    return query ? `${base}${query}` : base;
  },
  adminConfirmPromotion: () => `${process.env.REACT_APP_API_URL}${title}admin/confirm-promotion`,
};

