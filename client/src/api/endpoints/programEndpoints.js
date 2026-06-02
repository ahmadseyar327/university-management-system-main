const title = 'program/';

export const programEndpoints = {
  registerProgram: () => `${process.env.REACT_APP_API_URL}${title}register`,
  getPrograms: () => `${process.env.REACT_APP_API_URL}${title}getAll`,
  getProgramById: (id) => `${process.env.REACT_APP_API_URL}${title}get/${id}`,
  editProgram: (id) => `${process.env.REACT_APP_API_URL}${title}edit/${id}`,
  deleteProgram: (id) => `${process.env.REACT_APP_API_URL}${title}delete/${id}`,
  updateSemester: (id) => `${process.env.REACT_APP_API_URL}${title}semester/edit/${id}`,
  getSemesterCourses: (programId, semesterNumber) =>
    `${process.env.REACT_APP_API_URL}${title}${programId}/semester/${semesterNumber}/courses`,
  addCourseToSemester: () => `${process.env.REACT_APP_API_URL}${title}semester/course/add`,
  removeCourseFromSemester: (courseId) =>
    `${process.env.REACT_APP_API_URL}${title}semester/course/${courseId}`,
};

