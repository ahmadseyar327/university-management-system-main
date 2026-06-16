import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { programEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, PrimaryButton } from "../components";
import LoadingView from "../components/LoadingView";
import type { AdminTabParamList } from "../navigation/types";
import { colors, spacing } from "../theme";
import { listStyles } from "../theme/listStyles";
import { toastError } from "../utils/toasts";

type Program = { _id?: string; name?: string; description?: string; totalSemesters?: number };
type Props = DrawerScreenProps<AdminTabParamList, "AdminPrograms">;

export default function AdminProgramsScreen({ navigation }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    const res = await fetchResponse(programEndpoints.getPrograms(), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load programs");
      setPrograms([]);
      return;
    }
    setPrograms((res.data as Program[]) ?? []);
  }, []);

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

  if (loading && programs.length === 0) return <LoadingView />;

  return (
    <View style={listStyles.screen}>
      <View style={{ padding: spacing.md }}>
        <PrimaryButton title="Create program (use web for full editor)" onPress={() => navigation.navigate("AdminSemester")} />
      </View>
      <FlatList
        data={programs}
        keyExtractor={(item, i) => String(item._id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load().then(() => setRefreshing(false)); }} />}
        contentContainerStyle={listStyles.listFlush}
        ListEmptyComponent={
          <View style={listStyles.emptyWrap}>
            <EmptyState icon="school-outline" title="No programs yet." />
          </View>
        }
        ItemSeparatorComponent={() => <View style={listStyles.sep} />}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [listStyles.row, pressed && listStyles.rowPressed]}>
            <View style={{ flex: 1 }}>
              <Text style={listStyles.rowName}>{item.name ?? "Program"}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {item.totalSemesters ?? 8} semesters · {item.description ?? "No description"}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
