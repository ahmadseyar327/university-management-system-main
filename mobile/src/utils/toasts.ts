import { DeviceEventEmitter } from "react-native";

/** Mirrors web `toastSuccessObject` (used if you swap in a toast library later). */
export const toastSuccessObject = {
  autoClose: 2600,
};

/** Mirrors web `toastErrorObject`. */
export const toastErrorObject = {
  autoClose: 4200,
};

export const TOAST_EVENT = "ums-toast";

export type ToastPayload = {
  type: "success" | "error";
  message: string;
};

function cleanMessage(message: string): string {
  const msg = String(message ?? "").trim();
  if (!msg) return "Something went wrong. Please try again.";
  const lower = msg.toLowerCase();
  if (lower.includes("<html") || lower.includes("<!doctype") || lower.includes("</")) {
    return "Server returned an unexpected response. Please try again.";
  }
  return msg;
}

export function toastSuccess(message: string) {
  DeviceEventEmitter.emit(TOAST_EVENT, {
    type: "success",
    message: cleanMessage(message),
  } satisfies ToastPayload);
}

export function toastError(message: string) {
  DeviceEventEmitter.emit(TOAST_EVENT, {
    type: "error",
    message: cleanMessage(message),
  } satisfies ToastPayload);
}
