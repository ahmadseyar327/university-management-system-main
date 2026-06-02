const title = 'academic/';

// Semester-based academic workflow (backed by server/controllers/academicController.js)
export const semesterEndpoints = {
  enrollInProgram: () => `${process.env.REACT_APP_API_URL}${title}enroll`,

  getStudentDashboard: (studentId) =>
    `${process.env.REACT_APP_API_URL}${title}dashboard/${studentId}`,

  saveCourseResult: () => `${process.env.REACT_APP_API_URL}${title}course-result`,

  getCourseResultsForInstructor: ({ instructorId, semesterNumber, courseId }) => {
    const query = new URLSearchParams();
    if (instructorId) query.set('instructorId', instructorId);
    if (semesterNumber) query.set('semesterNumber', semesterNumber);
    if (courseId) query.set('courseId', courseId);
    return `${process.env.REACT_APP_API_URL}${title}course-result/instructor?${query.toString()}`;
  },

  adminPublishSemester: () => `${process.env.REACT_APP_API_URL}${title}admin/publish-semester`,
  adminOpenRegistration: () => `${process.env.REACT_APP_API_URL}${title}admin/open-registration`,
  adminCloseRegistration: () => `${process.env.REACT_APP_API_URL}${title}admin/close-registration`,

  adminEligibleStudents: ({ programId, semesterNumber }) =>
    `${process.env.REACT_APP_API_URL}${title}admin/eligible-students?programId=${programId}&semesterNumber=${semesterNumber}`,

  adminConfirmPromotion: () => `${process.env.REACT_APP_API_URL}${title}admin/confirm-promotion`,

  recalculateSemester: () => `${process.env.REACT_APP_API_URL}${title}semester/recalculate`,
};

