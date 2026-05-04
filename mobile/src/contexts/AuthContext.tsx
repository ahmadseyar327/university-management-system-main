import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const KEYS = {
  student: "student",
  instructor: "instructor",
  admin: "admin",
} as const;

export type UserRecord = Record<string, unknown>;

type AuthContextValue = {
  studentData: UserRecord | null;
  instructorData: UserRecord | null;
  adminData: UserRecord | null;
  setStudentData: (v: UserRecord | null) => void;
  setInstructorData: (v: UserRecord | null) => void;
  setAdminData: (v: UserRecord | null) => void;
  signOutStudent: () => Promise<void>;
  signOutInstructor: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  hydrated: boolean;
};

const authContext = createContext<AuthContextValue | null>(null);

function parseStored(json: string | null): UserRecord | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as UserRecord;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [studentData, setStudentDataState] = useState<UserRecord | null>(null);
  const [instructorData, setInstructorDataState] =
    useState<UserRecord | null>(null);
  const [adminData, setAdminDataState] = useState<UserRecord | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, i, a] = await Promise.all([
        AsyncStorage.getItem(KEYS.student),
        AsyncStorage.getItem(KEYS.instructor),
        AsyncStorage.getItem(KEYS.admin),
      ]);
      if (cancelled) return;
      setStudentDataState(parseStored(s));
      setInstructorDataState(parseStored(i));
      setAdminDataState(parseStored(a));
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setStudentData = useCallback((v: UserRecord | null) => {
    setStudentDataState(v);
    void (async () => {
      if (v) await AsyncStorage.setItem(KEYS.student, JSON.stringify(v));
      else await AsyncStorage.removeItem(KEYS.student);
    })();
  }, []);

  const setInstructorData = useCallback((v: UserRecord | null) => {
    setInstructorDataState(v);
    void (async () => {
      if (v) await AsyncStorage.setItem(KEYS.instructor, JSON.stringify(v));
      else await AsyncStorage.removeItem(KEYS.instructor);
    })();
  }, []);

  const setAdminData = useCallback((v: UserRecord | null) => {
    setAdminDataState(v);
    void (async () => {
      if (v) await AsyncStorage.setItem(KEYS.admin, JSON.stringify(v));
      else await AsyncStorage.removeItem(KEYS.admin);
    })();
  }, []);

  const signOutStudent = useCallback(async () => {
    setStudentDataState(null);
    await AsyncStorage.removeItem(KEYS.student);
  }, []);

  const signOutInstructor = useCallback(async () => {
    setInstructorDataState(null);
    await AsyncStorage.removeItem(KEYS.instructor);
  }, []);

  const signOutAdmin = useCallback(async () => {
    setAdminDataState(null);
    await AsyncStorage.removeItem(KEYS.admin);
  }, []);

  const value = useMemo(
    () => ({
      studentData,
      instructorData,
      adminData,
      setStudentData,
      setInstructorData,
      setAdminData,
      signOutStudent,
      signOutInstructor,
      signOutAdmin,
      hydrated,
    }),
    [
      studentData,
      instructorData,
      adminData,
      setStudentData,
      setInstructorData,
      setAdminData,
      signOutStudent,
      signOutInstructor,
      signOutAdmin,
      hydrated,
    ]
  );

  return (
    <authContext.Provider value={value}>{children}</authContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(authContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
