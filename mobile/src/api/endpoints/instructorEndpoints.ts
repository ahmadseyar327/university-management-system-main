import { getApiBaseUrl } from "../config";

const title = "instructor/";

export const instructorEndpoints = {
  loginInstructor: () => `${getApiBaseUrl()}${title}login`,
  registerInstructor: () => `${getApiBaseUrl()}${title}register`,
  getInstructors: () => `${getApiBaseUrl()}${title}getAll`,
  getAttendances: (id: string, courseId: string, date: string) =>
    `${getApiBaseUrl()}${title}getAttendances?instructorId=${id}&courseId=${courseId}&date=${date}`,
  postAttendance: () => `${getApiBaseUrl()}${title}postAttendance`,
  editAttendance: (id: string) => `${getApiBaseUrl()}${title}editAttendance/${id}`,
  getAcademics: (
    instructorId: string,
    courseId: string,
    examType: string,
    activityNumber: string
  ) =>
    `${getApiBaseUrl()}${title}getAcademics?instructorId=${instructorId}&courseId=${courseId}&examType=${examType}&activityNumber=${activityNumber}`,
  postAcademics: () => `${getApiBaseUrl()}${title}postAcademics`,
  editAcademics: (id: string) => `${getApiBaseUrl()}${title}editAcademics/${id}`,
  getSingleInstructor: (id: string) => `${getApiBaseUrl()}${title}get/${id}`,
  editInstructor: (id: string) => `${getApiBaseUrl()}${title}edit/${id}`,
  deleteSingleInstructor: (id: string) => `${getApiBaseUrl()}${title}delete/${id}`,
};
