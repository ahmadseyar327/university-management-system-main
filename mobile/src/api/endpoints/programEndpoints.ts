import { getApiBaseUrl } from "../config";

const title = "program/";

export const programEndpoints = {
  registerProgram: () => `${getApiBaseUrl()}${title}register`,
  getPrograms: () => `${getApiBaseUrl()}${title}getAll`,
  getProgramById: (id: string) => `${getApiBaseUrl()}${title}get/${id}`,
  editProgram: (id: string) => `${getApiBaseUrl()}${title}edit/${id}`,
  deleteProgram: (id: string) => `${getApiBaseUrl()}${title}delete/${id}`,
  updateSemester: (id: string) => `${getApiBaseUrl()}${title}semester/edit/${id}`,
  getSemesterCourses: (programId: string, semesterNumber: number) =>
    `${getApiBaseUrl()}${title}${programId}/semester/${semesterNumber}/courses`,
  addCourseToSemester: () => `${getApiBaseUrl()}${title}semester/course/add`,
  removeCourseFromSemester: (courseId: string) =>
    `${getApiBaseUrl()}${title}semester/course/${courseId}`,
};
