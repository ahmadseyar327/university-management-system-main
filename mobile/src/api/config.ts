/**
 * Web equivalent: `REACT_APP_API_URL` in Create React App.
 * Expo: set `EXPO_PUBLIC_API_URL` in `.env` (must end with `/v1/api/`).
 */
const DEFAULT_API_URL =
  "https://university-management-system-ca42.onrender.com/v1/api/";

export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;
  return raw.endsWith("/") ? raw : `${raw}/`;
}
