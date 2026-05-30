import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, PortalRole, roleThemes, spacing } from "../theme";

type Props = DrawerContentComponentProps & {
  role: PortalRole;
  userName: string;
  userEmail: string;
  onSignOut: () => void;
};

export default function PortalDrawerContent({
  role,
  userName,
  userEmail,
  onSignOut,
  ...props
}: Props) {
  const insets = useSafeAreaInsets();
  const theme = roleThemes[role];
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: theme.drawerBg }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "U"}</Text>
        </View>
        <Text style={styles.roleLabel}>{theme.label}</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {userEmail}
        </Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={styles.signOutBtn} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  roleLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: { fontSize: 20, fontWeight: "800", color: "#fff", marginBottom: 2 },
  userEmail: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  scroll: { paddingTop: spacing.sm },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  signOutText: { fontSize: 15, fontWeight: "600", color: colors.danger },
});
