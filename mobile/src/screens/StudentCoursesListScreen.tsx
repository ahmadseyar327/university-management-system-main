import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, SlideOverDetail } from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors } from "../theme";
import { listStyles } from "../theme/listStyles";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type Row = Record<string, unknown>;
type Props = DrawerScreenProps<StudentTabParamList, "StudentCourses">;

function courseTitle(row: Row) {
  return String(row.title ?? "Untitled course");
}

export default function StudentCoursesListScreen(_props: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [courses, setCourses] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    if (!studentId) return;
    const res = await fetchResponse(courseEndpoints.getCoursesOfStudent(studentId), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load courses");
      setCourses([]);
      return;
    }
    const data = (res.data as Row[]) ?? [];
    setCourses([...data].sort((a, b) => String(a.title).localeCompare(String(b.title))));
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

  if (loading && courses.length === 0) return <LoadingView />;

  return (
    <View style={listStyles.screen}>
      <FlatList
        data={courses}
        keyExtractor={(item, i) => String(item._id ?? i)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        contentContainerStyle={listStyles.listFlush}
        ListEmptyComponent={
          <View style={listStyles.emptyWrap}>
            <EmptyState icon="book-outline" title="No registered courses yet." />
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
              {courseTitle(item)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={listStyles.detailEyebrow}>Course</Text>
            <Text style={listStyles.detailTitle}>{courseTitle(detail)}</Text>
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
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Registered</Text>
              <Text style={listStyles.v}>{String(detail.createdAt ?? "—")}</Text>
            </View>
          </>
        ) : null}
      </SlideOverDetail>
    </View>
  );
}
