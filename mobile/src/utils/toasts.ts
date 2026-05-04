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

export function toastSuccess(message: string) {
  DeviceEventEmitter.emit(TOAST_EVENT, { type: "success", message } satisfies ToastPayload);
}

export function toastError(message: string) {
  DeviceEventEmitter.emit(TOAST_EVENT, { type: "error", message } satisfies ToastPayload);
}
