import { getApiBaseUrl } from "../config";

const title = "course/";

export const courseEndpoints = {
  registerCourse: () => `${getApiBaseUrl()}${title}register`,
  getCourses: () => `${getApiBaseUrl()}${title}getAll`,
  getStudentsOfInstructor: (id: string) =>
    `${getApiBaseUrl()}${title}registeredStudents/getAll/${id}`,
  offerCourse: () => `${getApiBaseUrl()}${title}offered/register/`,
  getCoursesOfInstructor: (id: string) =>
    `${getApiBaseUrl()}${title}offered/getAll/${id}`,
  getCoursesOfStudent: (id: string) =>
    `${getApiBaseUrl()}${title}registered/getAll/${id}`,
  getOfferedCourses: () => `${getApiBaseUrl()}${title}offered/getAll`,
  registerCourseByStudent: () => `${getApiBaseUrl()}${title}registered/register`,
  getSingleCourse: (id: string) => `${getApiBaseUrl()}${title}get/${id}`,
  deleteSingleCourse: (id: string) => `${getApiBaseUrl()}${title}delete/${id}`,
};
