// Global color palette — the RN equivalent of your :root CSS variables.
// Import these anywhere instead of hardcoding hex values, so the whole
// app can be re-themed from one place.
//
// Usage:
//   import { colors } from "../../../constants/colors";
//   <Text style={{ color: colors.cyan }}>Hello</Text>

export const colors = {
  cyan: "#39CCCC",
  darkBlue: "#052443",
  white: "#fefefe",
  cardBorder: "#dedede",
  textColor: "#767676",

  // A few extra semantic ones used across the delivery screens
  // (kept separate so the 5 "brand" colors above stay a 1:1 match
  // with your CSS file)
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  dangerBorder: "#f87171",
  success: "#16a34a",
  successBg: "#dcfce7",
  successBorder: "#4ade80",
  gray50: "#f9fafb",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray500: "#6b7280",
  gray700: "#374151",
  gray800: "#1f2937",
  black40: "rgba(0,0,0,0.4)",
};
