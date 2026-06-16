import { getApiBaseUrl } from "../config";

const title = "academic/";

export const academicEndpoints = {
  enrollInProgram: () => `${getApiBaseUrl()}${title}enroll`,
  getStudentDashboard: (studentId: string) => `${getApiBaseUrl()}${title}dashboard/${studentId}`,
  getStudentRecord: (studentId: string) => `${getApiBaseUrl()}${title}record/${studentId}`,
  getSemesterHistory: (studentId: string) => `${getApiBaseUrl()}${title}history/${studentId}`,

  saveCourseResult: () => `${getApiBaseUrl()}${title}course-result`,
  getCourseResultsForInstructor: (instructorId: string, courseId: string, semesterNumber: number) =>
    `${getApiBaseUrl()}${title}course-result/instructor?instructorId=${instructorId}&courseId=${courseId}&semesterNumber=${semesterNumber}`,

  studentConfirmPromotion: () => `${getApiBaseUrl()}${title}promotion/confirm`,
  getRegistrationStatus: (programId: string, targetSemester: number) =>
    `${getApiBaseUrl()}${title}registration/status?programId=${programId}&targetSemester=${targetSemester}`,

  adminPublishSemester: () => `${getApiBaseUrl()}${title}admin/publish-semester`,
  adminOpenRegistration: () => `${getApiBaseUrl()}${title}admin/open-registration`,
  adminCloseRegistration: () => `${getApiBaseUrl()}${title}admin/close-registration`,
  adminEligibleStudents: (programId: string, semesterNumber: number) =>
    `${getApiBaseUrl()}${title}admin/eligible-students?programId=${programId}&semesterNumber=${semesterNumber}`,
  adminConfirmPromotion: () => `${getApiBaseUrl()}${title}admin/confirm-promotion`,
  adminRetryFailedSemester: () => `${getApiBaseUrl()}${title}admin/retry-failed-semester`,
  recalculateSemester: () => `${getApiBaseUrl()}${title}semester/recalculate`,
};
