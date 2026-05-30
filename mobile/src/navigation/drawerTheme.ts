import { colors, PortalRole, roleThemes } from "../theme";

export function drawerScreenOptions(role: PortalRole) {
  const theme = roleThemes[role];
  return {
    drawerPosition: "left" as const,
    drawerType: "front" as const,
    overlayColor: colors.drawerOverlay,
    swipeEdgeWidth: 90,
    drawerActiveTintColor: theme.accent,
    drawerInactiveTintColor: colors.textSecondary,
    drawerActiveBackgroundColor: theme.accentSoft,
    drawerItemStyle: { borderRadius: 12, marginHorizontal: 8, marginVertical: 2 },
    drawerLabelStyle: { marginLeft: -8, fontWeight: "600" as const, fontSize: 15 },
    drawerStyle: {
      width: 300,
      backgroundColor: colors.surface,
      borderRightWidth: 0,
    },
    sceneStyle: { backgroundColor: colors.background },
    headerTintColor: theme.accent,
    headerTitleStyle: { fontWeight: "700" as const, fontSize: 17, color: colors.text },
    headerStyle: {
      backgroundColor: colors.surface,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
  };
}
