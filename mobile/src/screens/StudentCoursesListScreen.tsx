import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { academicEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, PrimaryButton, SlideOverDetail } from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors, spacing } from "../theme";
import { listStyles } from "../theme/listStyles";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type CourseRow = { id?: string; name?: string; code?: string; description?: string };
type Dashboard = {
  program?: { name?: string } | null;
  currentSemester?: number;
  semesterTitle?: string;
  status?: string;
  promotionStatus?: string;
  registrationOpen?: boolean;
  courses?: CourseRow[];
};
type Props = DrawerScreenProps<StudentTabParamList, "StudentCourses">;

export default function StudentCoursesListScreen({ navigation }: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<CourseRow | null>(null);
  const [promoting, setPromoting] = useState(false);
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    if (!studentId) return;
    const res = await fetchResponse(academicEndpoints.getStudentDashboard(studentId), 0, null);
    if (!res?.success) {
      if (!String(res?.message ?? "").toLowerCase().includes("not enrolled")) {
        toastError(res?.message ?? "Could not load courses");
      }
      setDashboard(null);
      return;
    }
    setDashboard(res.data as Dashboard);
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

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function confirmPromotion() {
    if (!studentId) return;
    setPromoting(true);
    try {
      const res = await fetchResponse(academicEndpoints.studentConfirmPromotion(), 1, { studentId });
      if (!res?.success) {
        toastError(res?.message ?? "Promotion failed");
        return;
      }
      toastSuccess(res.message ?? "Promoted");
      await load();
    } finally {
      setPromoting(false);
    }
  }

  const courses = dashboard?.courses ?? [];
  const showPromotion =
    dashboard?.status === "Ready For Registration" &&
    dashboard?.registrationOpen &&
    (dashboard?.promotionStatus === "PASSED SEMESTER" ||
      dashboard?.promotionStatus === "COMPLETED WITH REPEATS");

  if (loading && !dashboard) return <LoadingView />;

  if (!dashboard) {
    return (
      <View style={[listStyles.screen, { padding: spacing.md }]}>
        <EmptyState icon="school-outline" title="Not enrolled in a program." />
        <PrimaryButton title="Enroll in program" onPress={() => navigation.navigate("StudentRegister")} />
      </View>
    );
  }

  return (
    <View style={listStyles.screen}>
      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <Text style={{ fontWeight: "700", color: colors.text }}>
          {dashboard.program?.name} · Semester {dashboard.currentSemester}
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm }}>
          {dashboard.semesterTitle} · {dashboard.status}
        </Text>
        {showPromotion ? (
          <PrimaryButton title="Confirm promotion" loading={promoting} onPress={() => void confirmPromotion()} />
        ) : null}
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item, i) => String(item.id ?? i)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        contentContainerStyle={listStyles.listFlush}
        ListEmptyComponent={
          <View style={listStyles.emptyWrap}>
            <EmptyState icon="book-outline" title="No courses assigned for this semester." />
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
              {item.name ?? "Course"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={listStyles.detailEyebrow}>Course</Text>
            <Text style={listStyles.detailTitle}>{detail.name ?? "—"}</Text>
            <View style={listStyles.detailCard}>
              <Text style={listStyles.k}>Code</Text>
              <Text style={listStyles.v}>{detail.code ?? "—"}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Description</Text>
              <Text style={listStyles.v}>{detail.description ?? "—"}</Text>
            </View>
          </>
        ) : null}
      </SlideOverDetail>
    </View>
  );
}
