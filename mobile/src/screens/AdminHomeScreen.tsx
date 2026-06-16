import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { instructorEndpoints, studentEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import {
  DashboardHero,
  QuickActionCard,
  ScreenContainer,
  SlideOverDetail,
  StatCard,
} from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { AdminTabParamList } from "../navigation/types";
import { colors, spacing } from "../theme";
import { listStyles } from "../theme/listStyles";
import { mongoId } from "../utils/mongoId";

type Props = DrawerScreenProps<AdminTabParamList, "AdminOverview">;
type UserRow = Record<string, unknown> & { role: "Student" | "Teacher" };

function fmt(v: unknown): string {
  if (v == null) return "—";
  return String(v);
}

function displayName(user: UserRow) {
  return `${fmt(user.fname)} ${fmt(user.lname)}`.trim();
}

export default function AdminHomeScreen({ navigation }: Props) {
  const { adminData } = useAuth();
  const name = `${fmt(adminData?.fname)} ${fmt(adminData?.lname)}`.trim();
  const initials = `${String(adminData?.fname ?? "").charAt(0)}${String(adminData?.lname ?? "").charAt(0)}`.toUpperCase();

  const [students, setStudents] = useState<Record<string, unknown>[]>([]);
  const [instructors, setInstructors] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<UserRow | null>(null);

  const loadUsers = useCallback(async () => {
    const [studentRes, instructorRes] = await Promise.all([
      fetchResponse(studentEndpoints.getStudents(), 0, null),
      fetchResponse(instructorEndpoints.getInstructors(), 0, null),
    ]);
    setStudents(studentRes?.success && studentRes.data ? (studentRes.data as Record<string, unknown>[]) : []);
    setInstructors(
      instructorRes?.success && instructorRes.data ? (instructorRes.data as Record<string, unknown>[]) : []
    );
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadUsers();
      setLoading(false);
    })();
  }, [loadUsers]);

  const allUsers = useMemo<UserRow[]>(() => {
    const studentRows = students.map((s) => ({ ...s, role: "Student" as const }));
    const instructorRows = instructors.map((i) => ({ ...i, role: "Teacher" as const }));
    return [...studentRows, ...instructorRows].sort((a, b) =>
      displayName(a).localeCompare(displayName(b))
    );
  }, [students, instructors]);

  async function onRefresh() {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  }

  if (loading && allUsers.length === 0) return <LoadingView />;

  return (
    <ScreenContainer>
      <FlatList
        data={allUsers}
        keyExtractor={(item) => `${item.role}-${mongoId(item)}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.admin} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <DashboardHero
              name={name}
              subtitle="Administrator portal"
              initials={initials || "AD"}
              accentColor={colors.admin}
            />

            <View style={styles.statGrid}>
              <StatCard icon="people-outline" label="Students" value={String(students.length)} delay={80} />
              <StatCard icon="school-outline" label="Teachers" value={String(instructors.length)} delay={120} />
            </View>

            <Text style={styles.sectionTitle}>All users</Text>
            <Text style={styles.sectionSub}>
              {allUsers.length} student(s) and teacher(s) — tap to view details
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No users registered yet.</Text>
        }
        ItemSeparatorComponent={() => <View style={listStyles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [listStyles.row, pressed && listStyles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: colors.border }}
          >
            <View style={{ flex: 1 }}>
              <Text style={listStyles.rowName} numberOfLines={1}>
                {displayName(item)}
              </Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                {fmt(item.email)}
              </Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{item.role}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.admin} />
          </Pressable>
        )}
        ListFooterComponent={
          <View style={styles.actions}>
            <QuickActionCard icon="school-outline" label="Programs" onPress={() => navigation.navigate("AdminPrograms")} delay={140} />
            <QuickActionCard icon="calendar-outline" label="Semester" onPress={() => navigation.navigate("AdminSemester")} delay={160} />
            <QuickActionCard icon="people-outline" label="Instructors" onPress={() => navigation.navigate("AdminInstructors")} delay={180} />
            <QuickActionCard icon="notifications-outline" label="Offers" onPress={() => navigation.navigate("AdminOfferRequests")} delay={200} />
            <QuickActionCard icon="library-outline" label="Courses" onPress={() => navigation.navigate("AdminCourses")} delay={220} />
            <QuickActionCard icon="person-add-outline" label="Register" onPress={() => navigation.navigate("AdminRegInstructor")} delay={240} />
          </View>
        }
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={listStyles.detailEyebrow}>{detail.role}</Text>
            <Text style={listStyles.detailTitle}>{displayName(detail)}</Text>
            <View style={listStyles.detailCard}>
              <Text style={listStyles.k}>Email</Text>
              <Text style={listStyles.v}>{fmt(detail.email)}</Text>
              <View style={listStyles.divider} />
              {detail.role === "Student" ? (
                <>
                  <Text style={listStyles.k}>Roll number</Text>
                  <Text style={listStyles.v}>{fmt(detail.rollNumber)}</Text>
                  <View style={listStyles.divider} />
                </>
              ) : null}
              <Text style={listStyles.k}>Member since</Text>
              <Text style={listStyles.v}>{fmt(detail.createdAt)}</Text>
            </View>
          </>
        ) : null}
      </SlideOverDetail>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: spacing.xl },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  sectionTitle: { fontWeight: "700", fontSize: 16, color: colors.text, marginBottom: 4 },
  sectionSub: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.sm },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  roleBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  roleBadgeText: { fontSize: 10, fontWeight: "700", color: colors.admin, textTransform: "uppercase" },
  empty: { color: colors.textSecondary, textAlign: "center", paddingVertical: spacing.lg },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
});
