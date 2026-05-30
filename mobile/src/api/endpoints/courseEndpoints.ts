import { getApiBaseUrl } from "../config";

const title = "course/";

export const courseEndpoints = {
  registerCourse: () => `${getApiBaseUrl()}${title}register`,
  getCourses: () => `${getApiBaseUrl()}${title}getAll`,
  getStudentsOfInstructor: (id: string) =>
    `${getApiBaseUrl()}${title}registeredStudents/getAll/${id}`,
  assignCourseToInstructor: () => `${getApiBaseUrl()}${title}offered/register/`,
  getCourseAssignments: () => `${getApiBaseUrl()}${title}offered/assignments/getAll`,
  deleteCourseAssignment: (id: string) =>
    `${getApiBaseUrl()}${title}offered/assignments/delete/${id}`,
  instructorReviewOffer: (id: string) =>
    `${getApiBaseUrl()}${title}offered/instructor/review/${id}`,
  getCoursesOfInstructor: (id: string) =>
    `${getApiBaseUrl()}${title}offered/getAll/${id}`,
  getCoursesOfStudent: (id: string) =>
    `${getApiBaseUrl()}${title}registered/getAll/${id}`,
  getOfferedCourses: () => `${getApiBaseUrl()}${title}offered/getAll`,
  registerCourseByStudent: () => `${getApiBaseUrl()}${title}registered/register`,
  getSingleCourse: (id: string) => `${getApiBaseUrl()}${title}get/${id}`,
  deleteSingleCourse: (id: string) => `${getApiBaseUrl()}${title}delete/${id}`,
};
