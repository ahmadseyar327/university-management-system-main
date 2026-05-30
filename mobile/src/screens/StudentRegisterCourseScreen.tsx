import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, SlideOverDetail } from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { listStyles } from "../theme/listStyles";
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
  const [registeringId, setRegisteringId] = useState("");
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

    setRegisteringId(cId);
    const res = await fetchResponse(courseEndpoints.registerCourseByStudent(), 1, {
      studentId,
      courseId: cId,
      instructorId,
    });
    setRegisteringId("");
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
    <View style={listStyles.screen}>
      <FlatList
        data={listRows}
        keyExtractor={(item, i) => courseKey(item) || String(item._id ?? i)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        contentContainerStyle={listStyles.listFlush}
        ListEmptyComponent={
          <View style={listStyles.emptyWrap}>
            <EmptyState icon="school-outline" title="No offered courses." />
          </View>
        }
        ItemSeparatorComponent={() => <View style={listStyles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [listStyles.row, pressed && listStyles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: colors.border }}
          >
            <View style={styles.rowLeft}>
              <Text style={listStyles.rowName} numberOfLines={1}>
                {titleOf(item)}
              </Text>
              {item.__registered ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Registered</Text>
                </View>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={listStyles.detailEyebrow}>Course</Text>
            <Text style={listStyles.detailTitle}>{titleOf(detail)}</Text>
            <View style={listStyles.detailCard}>
              <Text style={listStyles.k}>Code</Text>
              <Text style={listStyles.v}>{String(detail.code ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Type</Text>
              <Text style={listStyles.v}>{String(detail.type ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Credit hours</Text>
              <Text style={listStyles.v}>{String(detail.creditHours ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Fee</Text>
              <Text style={listStyles.v}>{String(detail.fee ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Instructor</Text>
              <Text style={listStyles.v}>{String(detail.instructorName ?? "—")}</Text>
            </View>
            {registeredIds.has(courseKey(detail)) ? (
              <View style={styles.registeredBtn}>
                <Text style={styles.registeredTxt}>Registered</Text>
              </View>
            ) : (
              <Pressable style={styles.primaryBtn} onPress={() => void register(detail)}>
                {registeringId === courseKey(detail) ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.primaryTxt}>Register now</Text>
                )}
              </Pressable>
            )}
          </>
        ) : null}
      </SlideOverDetail>
    </View>
  );
}

const styles = StyleSheet.create({
  rowLeft: { flex: 1, marginRight: 8 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: colors.success, fontSize: 12, fontWeight: "700" },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryTxt: { color: colors.textInverse, fontWeight: "700", fontSize: 16 },
  registeredBtn: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.success,
  },
  registeredTxt: { color: colors.success, fontWeight: "700", fontSize: 16 },
});
