import { getApiBaseUrl } from "../config";

const title = "program/";

export const programEndpoints = {
  getPrograms: () => `${getApiBaseUrl()}${title}getAll`,
  getProgramById: (id: string) => `${getApiBaseUrl()}${title}get/${id}`,
};
