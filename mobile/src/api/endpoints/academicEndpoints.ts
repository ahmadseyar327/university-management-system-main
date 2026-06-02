import { getApiBaseUrl } from "../config";

const title = "academic/";

export const academicEndpoints = {
  enrollInProgram: () => `${getApiBaseUrl()}${title}enroll`,
  getStudentDashboard: (studentId: string) => `${getApiBaseUrl()}${title}dashboard/${studentId}`,
  getStudentRecord: (studentId: string) => `${getApiBaseUrl()}${title}record/${studentId}`,
};
