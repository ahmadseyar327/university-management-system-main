export const colors = {
  primary: "#1d4ed8",
  primaryDark: "#1e3a8a",
  primaryLight: "#3b82f6",
  primarySoft: "#eff6ff",
  primaryMuted: "#dbeafe",

  background: "#f0f4ff",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",

  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  textInverse: "#ffffff",

  success: "#16a34a",
  successSoft: "#dcfce7",
  warning: "#ca8a04",
  warningSoft: "#fef9c3",
  danger: "#dc2626",
  dangerSoft: "#fef2f2",

  student: "#4f46e5",
  instructor: "#059669",
  admin: "#c2410c",

  overlay: "rgba(15, 23, 42, 0.45)",
  drawerOverlay: "rgba(15, 23, 42, 0.35)",
};

export const roleThemes = {
  student: {
    accent: "#1d4ed8",
    accentSoft: "#dbeafe",
    drawerBg: "#1e40af",
    label: "Student Portal",
  },
  instructor: {
    accent: "#047857",
    accentSoft: "#d1fae5",
    drawerBg: "#065f46",
    label: "Instructor Portal",
  },
  admin: {
    accent: "#c2410c",
    accentSoft: "#ffedd5",
    drawerBg: "#9a3412",
    label: "Admin Portal",
  },
} as const;

export type PortalRole = keyof typeof roleThemes;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const shadow = {
  card: {
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  soft: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const typography = {
  hero: { fontSize: 32, fontWeight: "800" as const, letterSpacing: -0.8 },
  title: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.4 },
  subtitle: { fontSize: 16, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0.4 },
  label: { fontSize: 13, fontWeight: "600" as const },
};
