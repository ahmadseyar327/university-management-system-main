import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, SimpleSelect, SlideOverDetail } from "../components";
import LoadingView from "../components/LoadingView";
import type { SelectOption } from "../components/SimpleSelect";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { listStyles } from "../theme/listStyles";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type Row = Record<string, unknown> & {
  courseId?: string;
  courseTitle?: string;
  fname?: string;
  lname?: string;
  rollNumber?: unknown;
  email?: string;
  createdAt?: string;
};

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorStudents">;

function studentName(item: Row) {
  return `${String(item.fname ?? "").trim()} ${String(item.lname ?? "").trim()}`.trim() || "—";
}

export default function InstructorStudentsScreen(_props: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [rows, setRows] = useState<Row[]>([]);
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Row | null>(null);
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getStudentsOfInstructor(instructorId), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load students");
      setRows([]);
      return;
    }
    const data = (res.data as Row[]) ?? [];
    setRows(
      [...data].sort((a, b) => {
        const fn = String(a.fname).localeCompare(String(b.fname));
        return fn !== 0 ? fn : String(a.lname).localeCompare(String(b.lname));
      })
    );
  }, [instructorId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (firstFocus.current) {
          setLoading(true);
          firstFocus.current = false;
        }
        await load();
        if (!cancelled) setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [load])
  );

  const courseOptions: SelectOption[] = useMemo(() => {
    const seen = new Set<string>();
    return rows
      .filter((r) => {
        const id = String(r.courseId ?? "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .sort((a, b) => String(a.courseTitle).localeCompare(String(b.courseTitle)))
      .map((r) => ({ label: String(r.courseTitle ?? ""), value: String(r.courseId ?? "") }));
  }, [rows]);

  const filtered = courseId ? rows.filter((r) => String(r.courseId) === courseId) : [];

  if (loading && rows.length === 0) return <LoadingView />;

  return (
    <View style={listStyles.screen}>
      <View style={styles.filterBar}>
        <View style={[styles.filterCard, shadow.soft]}>
          <SimpleSelect label="Course" options={courseOptions} value={courseId} onChange={setCourseId} />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item, i) => mongoId(item) || `s-${i}`}
        contentContainerStyle={listStyles.listFlush}
        ListEmptyComponent={
          <View style={listStyles.emptyWrap}>
            <EmptyState
              icon="people-outline"
              title={courseId ? "No students in this course." : "Select a course"}
              message={courseId ? undefined : "Choose a course above to see enrolled students."}
            />
          </View>
        }
        ItemSeparatorComponent={() => <View style={listStyles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [listStyles.row, pressed && listStyles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: colors.border }}
          >
            <Text style={listStyles.rowName} numberOfLines={1}>
              {studentName(item)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.instructor} />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={listStyles.detailEyebrow}>Student</Text>
            <Text style={listStyles.detailTitle}>{studentName(detail)}</Text>
            <View style={listStyles.detailCard}>
              <Text style={listStyles.k}>Roll number</Text>
              <Text style={listStyles.v}>{String(detail.rollNumber ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Email</Text>
              <Text style={listStyles.v}>{String(detail.email ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Course</Text>
              <Text style={listStyles.v}>{String(detail.courseTitle ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Enrolled</Text>
              <Text style={listStyles.v}>{String(detail.createdAt ?? "—")}</Text>
            </View>
          </>
        ) : null}
      </SlideOverDetail>
    </View>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
