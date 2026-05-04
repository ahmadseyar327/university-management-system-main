/**
 * Adapted from web `client/src/api/service.js`.
 * Same numeric `type` contract: 0 GET, 1 POST JSON, 2 PUT JSON, 3 DELETE, 4/5 multipart-style.
 */
export type FetchMethodType = 0 | 1 | 2 | 3 | 4 | 5;

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function fetchResponse<T = unknown>(
  url: string,
  type: FetchMethodType,
  bodyData?: unknown
): Promise<ApiResponse<T> | undefined> {
  let options: RequestInit;
  switch (type) {
    case 0:
      options = { method: "GET" };
      break;
    case 1:
      options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData ?? {}),
      };
      break;
    case 2:
      options = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData ?? {}),
      };
      break;
    case 3:
      options = { method: "DELETE" };
      break;
    case 4:
      options = { method: "POST", body: bodyData as BodyInit };
      break;
    case 5:
      options = { method: "PUT", body: bodyData as BodyInit };
      break;
    default:
      return undefined;
  }

  try {
    const res = await fetch(url, options);
    if (res.status === 204) {
      return { success: true, message: "", data: [] as unknown as T };
    }
    const text = await res.text();
    let jsonData: ApiResponse<T>;
    try {
      jsonData = text ? JSON.parse(text) : { success: false };
    } catch {
      return {
        success: false,
        message: text || `Invalid response from server (HTTP ${res.status})`,
      };
    }
    if (!res.ok && jsonData.success === undefined) {
      jsonData = { ...jsonData, success: false };
    }
    if (!res.ok && jsonData.success === false && !jsonData.message) {
      jsonData = {
        ...jsonData,
        message: `Request failed (HTTP ${res.status}). Check API URL matches the server your web app uses.`,
      };
    }
    return jsonData;
  } catch {
    return { success: false, message: "Network request failed." };
  }
}
