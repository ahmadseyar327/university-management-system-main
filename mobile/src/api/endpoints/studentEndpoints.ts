import { getApiBaseUrl } from "../config";

const title = "student/";

export const studentEndpoints = {
  loginStudent: () => `${getApiBaseUrl()}${title}login`,
  registerStudent: () => `${getApiBaseUrl()}${title}register`,
  getStudents: () => `${getApiBaseUrl()}${title}getAll`,
  getSingleStudent: (id: string) => `${getApiBaseUrl()}${title}get/${id}`,
  getAcademics: (id: string, courseId: string, examType: string) =>
    `${getApiBaseUrl()}${title}getAcademics?studentId=${id}&courseId=${courseId}&examType=${examType}`,
  getAttendances: (id: string, courseId: string) =>
    `${getApiBaseUrl()}${title}getAttendances?studentId=${id}&courseId=${courseId}`,
  getCourseAndExamTypeNames: (id: string) =>
    `${getApiBaseUrl()}${title}getCourseAndExamTypeNames/${id}`,
  editStudent: (id: string) => `${getApiBaseUrl()}${title}edit/${id}`,
  deleteSingleStudent: (id: string) => `${getApiBaseUrl()}${title}delete/${id}`,
};
