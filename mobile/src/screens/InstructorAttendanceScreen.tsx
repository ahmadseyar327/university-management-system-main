import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { courseEndpoints, instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton } from "../components";
import SimpleSelect, { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Stud = Record<string, unknown> & {
  _id?: string;
  courseId?: string;
  courseTitle?: string;
  fname?: string;
  lname?: string;
  rollNumber?: unknown;
};

type AttRow = Record<string, unknown> & {
  studentId?: string;
  status?: string;
  _id?: string;
  name?: string;
};

type AttDoc = Record<string, unknown> & {
  _id?: string;
  date?: string;
  courseId?: string;
  attendance?: AttRow[];
};

type Props = BottomTabScreenProps<InstructorTabParamList, "InstructorAttendance">;

export default function InstructorAttendanceScreen(_props: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [courseId, setCourseId] = useState("");
  const [students, setStudents] = useState<Stud[]>([]);
  const [doc, setDoc] = useState<AttDoc | null>(null);
  const [rows, setRows] = useState<AttRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getStudentsOfInstructor(instructorId), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load students");
      setStudents([]);
      return;
    }
    const data = (res.data as Stud[]) ?? [];
    setStudents(
      [...data].sort((a, b) => {
        const fn = String(a.fname).localeCompare(String(b.fname));
        return fn !== 0 ? fn : String(a.lname).localeCompare(String(b.lname));
      })
    );
  }, [instructorId]);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      await loadStudents();
      if (!c) setLoading(false);
    })();
    return () => {
      c = true;
    };
  }, [loadStudents]);

  const courseOptions: SelectOption[] = useMemo(() => {
    const seen = new Set<string>();
    return students
      .filter((s) => {
        const id = String(s.courseId ?? "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .sort((a, b) => String(a.courseTitle).localeCompare(String(b.courseTitle)))
      .map((s) => ({ label: String(s.courseTitle ?? ""), value: String(s.courseId ?? "") }));
  }, [students]);

  const buildFreshRows = useCallback(
    (course: string, att: AttDoc | null) => {
      if (att?.attendance?.length) {
        return att.attendance.map((a) => ({
          ...a,
          name: `${String(a.fname ?? "")} ${String(a.lname ?? "")}`.trim(),
        }));
      }
      return students
        .filter((s) => String(s.courseId) === course)
        .map((s) => ({
          studentId: mongoId(s),
          _id: mongoId(s),
          status: "N/A",
          fname: s.fname,
          lname: s.lname,
          rollNumber: s.rollNumber,
          name: `${String(s.fname ?? "")} ${String(s.lname ?? "")}`.trim(),
        }));
    },
    [students]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!courseId || !date) {
        setDoc(null);
        setRows([]);
        return;
      }
      const res = await fetchResponse(
        instructorEndpoints.getAttendances(instructorId, courseId, date),
        0,
        null
      );
      if (cancelled) return;
      const list = (res?.data as AttDoc[]) ?? [];
      const found =
        list.find((a) => String(a.courseId ?? "") === courseId) ?? (list.length ? list[0] : null);
      setDoc(found);
      setRows(buildFreshRows(courseId, found));
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, date, instructorId, students, buildFreshRows]);

  async function submit() {
    if (!courseId || !date) {
      toastError("Select course and date.");
      return;
    }
    const attendance = rows.map((r) => ({
      studentId: String(r.studentId ?? r._id ?? ""),
      status: String(r.status ?? "N/A"),
      isPublic: true,
    }));
    setSaving(true);
    try {
      if (doc?._id) {
        const res = await fetchResponse(instructorEndpoints.editAttendance(String(doc._id)), 2, {
          ...doc,
          date,
          attendance,
          instructorId,
          courseId,
        });
        if (!res?.success) toastError(res?.message ?? "Update failed");
        else toastSuccess(res.message ?? "Updated");
      } else {
        const res = await fetchResponse(instructorEndpoints.postAttendance(), 1, {
          date,
          attendance,
          instructorId,
          courseId,
        });
        if (!res?.success) toastError(res?.message ?? "Post failed");
        else toastSuccess(res.message ?? "Posted");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingView />;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.inner}>
      <FormTextInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} autoCapitalize="none" />
      <SimpleSelect label="Course" options={courseOptions} value={courseId} onChange={setCourseId} />
      <Text style={styles.hint}>{doc?._id ? "Editing saved attendance." : "New attendance (post to save)."}</Text>
      {rows.map((item, index) => (
        <View key={String(item.studentId ?? item._id ?? index)} style={styles.row}>
          <Text style={styles.roll}>{String(item.rollNumber ?? "—")}</Text>
          <Text style={styles.nm}>{String(item.name ?? "")}</Text>
          <TextInput
            style={styles.status}
            value={String(item.status ?? "")}
            onChangeText={(t) => {
              const next = [...rows];
              next[index] = { ...next[index], status: t };
              setRows(next);
            }}
          />
        </View>
      ))}
      <PrimaryButton
        title={doc?._id ? "Update attendance" : "Post attendance"}
        loading={saving}
        onPress={() => void submit()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff" },
  inner: { padding: 16, paddingBottom: 40 },
  hint: { color: "#718096", marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },
  roll: { width: 56, fontSize: 13, color: "#4a5568" },
  nm: { flex: 1, fontSize: 14, color: "#1a202c" },
  status: {
    width: 72,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: "center",
  },
});
