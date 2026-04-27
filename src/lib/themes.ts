// Theme configuration system for PRism

export type ThemeName = "midnight" | "ocean" | "forest" | "sunset" | "aurora";

export interface ThemeColors {
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  bgCardHover: string;
  bgGlass: string;

  // Border colors
  borderPrimary: string;
  borderSecondary: string;
  borderAccent: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;

  // Accent colors
  accentPrimary: string;
  accentSecondary: string;
  accentGradientFrom: string;
  accentGradientTo: string;

  // Risk colors (consistent across themes)
  riskLow: string;
  riskMedium: string;
  riskHigh: string;
  riskCritical: string;

  // Status colors
  statusAdded: string;
  statusModified: string;
  statusRemoved: string;
  statusRenamed: string;

  // Graph node colors by type
  nodeSource: string;
  nodeTest: string;
  nodeConfig: string;
  nodeDoc: string;
  nodeAsset: string;
  nodeDep: string;
  nodeInfra: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  colors: ThemeColors;
  icon: string;
}

export const themes: Record<ThemeName, Theme> = {
  midnight: {
    name: "midnight",
    label: "Midnight",
    icon: "🌙",
    colors: {
      bgPrimary: "#09090b",
      bgSecondary: "#18181b",
      bgTertiary: "#27272a",
      bgCard: "rgba(24, 24, 27, 0.8)",
      bgCardHover: "rgba(39, 39, 42, 0.9)",
      bgGlass: "rgba(9, 9, 11, 0.7)",

      borderPrimary: "#27272a",
      borderSecondary: "#3f3f46",
      borderAccent: "#6366f1",

      textPrimary: "#fafafa",
      textSecondary: "#a1a1aa",
      textMuted: "#71717a",
      textAccent: "#818cf8",

      accentPrimary: "#6366f1",
      accentSecondary: "#8b5cf6",
      accentGradientFrom: "#6366f1",
      accentGradientTo: "#a855f7",

      riskLow: "#22c55e",
      riskMedium: "#eab308",
      riskHigh: "#f97316",
      riskCritical: "#ef4444",

      statusAdded: "#22c55e",
      statusModified: "#eab308",
      statusRemoved: "#ef4444",
      statusRenamed: "#3b82f6",

      nodeSource: "#3b82f6",
      nodeTest: "#22c55e",
      nodeConfig: "#f97316",
      nodeDoc: "#8b5cf6",
      nodeAsset: "#ec4899",
      nodeDep: "#06b6d4",
      nodeInfra: "#eab308",
    },
  },

  ocean: {
    name: "ocean",
    label: "Ocean",
    icon: "🌊",
    colors: {
      bgPrimary: "#0a1628",
      bgSecondary: "#0f2340",
      bgTertiary: "#1a365d",
      bgCard: "rgba(15, 35, 64, 0.8)",
      bgCardHover: "rgba(26, 54, 93, 0.9)",
      bgGlass: "rgba(10, 22, 40, 0.7)",

      borderPrimary: "#1e3a5f",
      borderSecondary: "#2563eb",
      borderAccent: "#0ea5e9",

      textPrimary: "#f0f9ff",
      textSecondary: "#7dd3fc",
      textMuted: "#38bdf8",
      textAccent: "#0ea5e9",

      accentPrimary: "#0ea5e9",
      accentSecondary: "#06b6d4",
      accentGradientFrom: "#0ea5e9",
      accentGradientTo: "#22d3ee",

      riskLow: "#34d399",
      riskMedium: "#fbbf24",
      riskHigh: "#fb923c",
      riskCritical: "#f87171",

      statusAdded: "#34d399",
      statusModified: "#fbbf24",
      statusRemoved: "#f87171",
      statusRenamed: "#60a5fa",

      nodeSource: "#60a5fa",
      nodeTest: "#34d399",
      nodeConfig: "#fb923c",
      nodeDoc: "#a78bfa",
      nodeAsset: "#f472b6",
      nodeDep: "#22d3ee",
      nodeInfra: "#fbbf24",
    },
  },

  forest: {
    name: "forest",
    label: "Forest",
    icon: "🌲",
    colors: {
      bgPrimary: "#0d1117",
      bgSecondary: "#161b22",
      bgTertiary: "#21262d",
      bgCard: "rgba(22, 27, 34, 0.8)",
      bgCardHover: "rgba(33, 38, 45, 0.9)",
      bgGlass: "rgba(13, 17, 23, 0.7)",

      borderPrimary: "#30363d",
      borderSecondary: "#484f58",
      borderAccent: "#22c55e",

      textPrimary: "#e6edf3",
      textSecondary: "#8b949e",
      textMuted: "#6e7681",
      textAccent: "#4ade80",

      accentPrimary: "#22c55e",
      accentSecondary: "#10b981",
      accentGradientFrom: "#22c55e",
      accentGradientTo: "#34d399",

      riskLow: "#4ade80",
      riskMedium: "#facc15",
      riskHigh: "#fb923c",
      riskCritical: "#f87171",

      statusAdded: "#4ade80",
      statusModified: "#facc15",
      statusRemoved: "#f87171",
      statusRenamed: "#60a5fa",

      nodeSource: "#60a5fa",
      nodeTest: "#4ade80",
      nodeConfig: "#fb923c",
      nodeDoc: "#c084fc",
      nodeAsset: "#f472b6",
      nodeDep: "#2dd4bf",
      nodeInfra: "#facc15",
    },
  },

  sunset: {
    name: "sunset",
    label: "Sunset",
    icon: "🌅",
    colors: {
      bgPrimary: "#1a0a0a",
      bgSecondary: "#2d1515",
      bgTertiary: "#3d1f1f",
      bgCard: "rgba(45, 21, 21, 0.8)",
      bgCardHover: "rgba(61, 31, 31, 0.9)",
      bgGlass: "rgba(26, 10, 10, 0.7)",

      borderPrimary: "#4a2020",
      borderSecondary: "#6b2f2f",
      borderAccent: "#f97316",

      textPrimary: "#fef2f2",
      textSecondary: "#fca5a5",
      textMuted: "#f87171",
      textAccent: "#fb923c",

      accentPrimary: "#f97316",
      accentSecondary: "#ef4444",
      accentGradientFrom: "#f97316",
      accentGradientTo: "#ef4444",

      riskLow: "#4ade80",
      riskMedium: "#fbbf24",
      riskHigh: "#fb923c",
      riskCritical: "#ef4444",

      statusAdded: "#4ade80",
      statusModified: "#fbbf24",
      statusRemoved: "#ef4444",
      statusRenamed: "#60a5fa",

      nodeSource: "#60a5fa",
      nodeTest: "#4ade80",
      nodeConfig: "#fb923c",
      nodeDoc: "#e879f9",
      nodeAsset: "#f472b6",
      nodeDep: "#2dd4bf",
      nodeInfra: "#fbbf24",
    },
  },

  aurora: {
    name: "aurora",
    label: "Aurora",
    icon: "✨",
    colors: {
      bgPrimary: "#0f0f23",
      bgSecondary: "#1a1a2e",
      bgTertiary: "#252541",
      bgCard: "rgba(26, 26, 46, 0.8)",
      bgCardHover: "rgba(37, 37, 65, 0.9)",
      bgGlass: "rgba(15, 15, 35, 0.7)",

      borderPrimary: "#2d2d4a",
      borderSecondary: "#3d3d5c",
      borderAccent: "#a855f7",

      textPrimary: "#f5f5ff",
      textSecondary: "#c4b5fd",
      textMuted: "#a78bfa",
      textAccent: "#c084fc",

      accentPrimary: "#a855f7",
      accentSecondary: "#ec4899",
      accentGradientFrom: "#a855f7",
      accentGradientTo: "#ec4899",

      riskLow: "#4ade80",
      riskMedium: "#fbbf24",
      riskHigh: "#fb923c",
      riskCritical: "#f87171",

      statusAdded: "#4ade80",
      statusModified: "#fbbf24",
      statusRemoved: "#f87171",
      statusRenamed: "#60a5fa",

      nodeSource: "#60a5fa",
      nodeTest: "#4ade80",
      nodeConfig: "#fb923c",
      nodeDoc: "#e879f9",
      nodeAsset: "#f472b6",
      nodeDep: "#2dd4bf",
      nodeInfra: "#fbbf24",
    },
  },
};

export const defaultTheme: ThemeName = "midnight";

export function getTheme(name: ThemeName): Theme {
  return themes[name] || themes[defaultTheme];
}

// CSS custom properties generator
export function generateCSSVariables(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`] = value;
  });
  return vars;
}
