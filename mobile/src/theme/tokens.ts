export const colors = {
  primaryPurple: "#6C3CFF",
  mint: "#2DD4A1",
  yellow: "#FFD43B",
  pink: "#FF8AAE",
  lavender: "#E9E6FF",
  ink: "#111827",
  slate: "#475569",
  stone: "#F2F2F7",
  cream: "#FFF9F2",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  display: "BricolageGrotesque",
  body: "Inter",
} as const;

export const nomiTheme = {
  colors,
  spacing,
  radius,
  typography,
} as const;

export type NomiTheme = typeof nomiTheme;
