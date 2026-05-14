import { Platform } from "react-native";

/**
 * Web equivalent: `REACT_APP_API_URL` in Create React App.
 * Expo: set `EXPO_PUBLIC_API_URL` in `.env` (must end with `/v1/api/`).
 */
const DEFAULT_API_URL =
  "https://university-management-system-ca42.onrender.com/v1/api/";

const DEFAULT_LOCAL_API_URL = (): string => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/v1/api/";
  }
  if (Platform.OS === "web" || Platform.OS === "ios") {
    return "http://localhost:5000/v1/api/";
  }
  return "http://localhost:5000/v1/api/";
};

export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (raw) {
    return raw.endsWith("/") ? raw : `${raw}/`;
  }
  if (__DEV__) {
    return DEFAULT_LOCAL_API_URL();
  }
  return DEFAULT_API_URL;
}
