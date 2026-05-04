import { getApiBaseUrl } from "../config";

const title = "admin/";

export const adminEndpoints = {
  loginAdmin: () => `${getApiBaseUrl()}${title}login`,
  registerAdmin: () => `${getApiBaseUrl()}${title}register`,
  getAdmins: () => `${getApiBaseUrl()}${title}getAll`,
  getSingleAdmin: (id: string) => `${getApiBaseUrl()}${title}get/${id}`,
  editAdmin: (id: string) => `${getApiBaseUrl()}${title}edit/${id}`,
  deleteSingleAdmin: (id: string) => `${getApiBaseUrl()}${title}delete/${id}`,
};
