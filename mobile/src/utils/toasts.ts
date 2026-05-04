import { Alert } from "react-native";

/** Mirrors web `toastSuccessObject` (used if you swap in a toast library later). */
export const toastSuccessObject = {
  autoClose: 2000,
};

/** Mirrors web `toastErrorObject`. */
export const toastErrorObject = {
  autoClose: 5000,
};

export function toastSuccess(message: string) {
  Alert.alert("Success", message);
}

export function toastError(message: string) {
  Alert.alert("Error", message);
}
