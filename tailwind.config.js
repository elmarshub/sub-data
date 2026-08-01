const { colors } = require("./constants/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/dist/tailwind")],
  theme: {
    extend: {
      colors: {
        background: colors.background,
        foreground: colors.foreground,
        card: colors.card,
        muted: colors.muted,
        "muted-foreground": colors.mutedForeground,
        primary: colors.primary,
        accent: colors.accent,
        border: colors.border,
        success: colors.success,
        destructive: colors.destructive,
        subscription: colors.subscription,
      },
      spacing: {
        18: "72px",
        30: "120px",
        50: "200px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["sans-regular"],
        "sans-light": ["sans-light"],
        "sans-medium": ["sans-medium"],
        "sans-semibold": ["sans-semibold"],
        "sans-bold": ["sans-bold"],
        "sans-extrabold": ["sans-extrabold"],
      },
    },
  },
  plugins: [],
};
