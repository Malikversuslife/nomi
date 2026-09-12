export const colors = {
  primaryPurple: "#7540D8",
  deepPurple: "#5425AE",
  lightPurple: "#A77AEF",
  lavender: "#EDE3FF",
  cream: "#FBF8F3",
  ink: "#211D27",
  slate: "#69636F",
  warmSurface: "#F5F0E9",
  stone: "#E5DED7",
  white: "#FFFFFF",
  mint: "#25A99A",
  yellow: "#F5D04B",
  pink: "#FF8AAE",
  math: "#4D73E6",
  physics: "#F29B45",
  chemistry: "#25A99A",
  biology: "#63A653",
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
