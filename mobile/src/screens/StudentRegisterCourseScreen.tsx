import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import LoadingView from "../components/LoadingView";
import SlideOverDetail from "../components/SlideOverDetail";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Row = Record<string, unknown> & { _id?: string; instructorId?: string; courseId?: string };
type Props = DrawerScreenProps<StudentTabParamList, "StudentRegister">;

function titleOf(item: Row) {
  return String(item.title ?? "Untitled course");
}

function courseKey(item: Row): string {
  const byId = mongoId(item);
  if (byId) return byId;
  const courseId = item.courseId;
  if (typeof courseId === "string") return courseId;
  if (courseId && typeof courseId === "object") {
    const id = mongoId(courseId as Record<string, unknown>);
    if (id) return id;
  }
  return "";
}

export default function StudentRegisterCourseScreen(_props: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [courses, setCourses] = useState<Row[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    const [offeredRes, myRes] = await Promise.all([
      fetchResponse(courseEndpoints.getOfferedCourses(), 0, null),
      studentId ? fetchResponse(courseEndpoints.getCoursesOfStudent(studentId), 0, null) : Promise.resolve(null),
    ]);

    if (!offeredRes?.success) {
      toastError(offeredRes?.message ?? "Could not load offered courses");
      setCourses([]);
    } else {
      const data = (offeredRes.data as Row[]) ?? [];
      setCourses(
        [...data].sort((a, b) => {
          const t = String(a.title).localeCompare(String(b.title));
          return t !== 0 ? t : String(a.instructorName).localeCompare(String(b.instructorName));
        })
      );
    }

    if (myRes?.success) {
      const mine = (myRes.data as Row[]) ?? [];
      setRegisteredIds(new Set(mine.map((m) => courseKey(m)).filter(Boolean)));
    } else {
      setRegisteredIds(new Set());
    }
  }, [studentId]);

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

  async function register(item: Row) {
    const cId = courseKey(item);
    const instructorId =
      typeof item.instructorId === "string"
        ? item.instructorId
        : mongoId(item.instructorId as Record<string, unknown> | undefined);
    if (!cId || !instructorId) {
      toastError("Missing course or instructor id.");
      return;
    }
    if (registeredIds.has(cId)) {
      toastSuccess("You are already registered for this course.");
      return;
    }

    Alert.alert("Register course", `Register for ${titleOf(item)}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Register",
        onPress: async () => {
          const res = await fetchResponse(courseEndpoints.registerCourseByStudent(), 1, {
            studentId,
            courseId: cId,
            instructorId,
          });
          if (!res?.success) {
            toastError(res?.message ?? "Registration failed");
            return;
          }
          toastSuccess(res.message ?? "Course registered successfully.");
          setRegisteredIds((prev) => {
            const next = new Set(prev);
            next.add(cId);
            return next;
          });
          await load();
        },
      },
    ]);
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const listRows = useMemo(
    () =>
      courses.map((c) => ({
        ...c,
        __registered: registeredIds.has(courseKey(c)),
      })),
    [courses, registeredIds]
  );

  if (loading && courses.length === 0) return <LoadingView />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={listRows}
        keyExtractor={(item, i) => courseKey(item) || String(item._id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No offered courses.</Text>}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: "#e2e8f0" }}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowName} numberOfLines={1}>
                {titleOf(item)}
              </Text>
              {item.__registered ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Registered</Text>
                </View>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={styles.detailEyebrow}>Course</Text>
            <Text style={styles.detailTitle}>{titleOf(detail)}</Text>
            <View style={styles.detailCard}>
              <Text style={styles.k}>Code</Text>
              <Text style={styles.v}>{String(detail.code ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Type</Text>
              <Text style={styles.v}>{String(detail.type ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Credit hours</Text>
              <Text style={styles.v}>{String(detail.creditHours ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Fee</Text>
              <Text style={styles.v}>{String(detail.fee ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Instructor</Text>
              <Text style={styles.v}>{String(detail.instructorName ?? "—")}</Text>
            </View>
            {registeredIds.has(courseKey(detail)) ? (
              <View style={styles.registeredBtn}>
                <Text style={styles.registeredTxt}>Registered</Text>
              </View>
            ) : (
              <Pressable style={styles.primaryBtn} onPress={() => void register(detail)}>
                <Text style={styles.primaryTxt}>Register now</Text>
              </Pressable>
            )}
          </>
        ) : null}
      </SlideOverDetail>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },
  list: { paddingVertical: 8, paddingBottom: 40 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40 },
  sep: { height: 1, backgroundColor: "#e2e8f0", marginLeft: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  rowPressed: { backgroundColor: "#f8fafc" },
  rowLeft: { flex: 1, marginRight: 8 },
  rowName: { fontSize: 17, fontWeight: "600", color: "#0f172a" },
  badge: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: "#d1fae5",
    borderColor: "#86efac",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: "#047857", fontSize: 12, fontWeight: "700" },
  detailEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  k: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 },
  v: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginBottom: 14 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 4 },
  primaryBtn: {
    backgroundColor: "#1d4ed8",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  registeredBtn: {
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#86efac",
  },
  registeredTxt: { color: "#047857", fontWeight: "700", fontSize: 16 },
});
