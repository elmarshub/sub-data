/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/dist/tailwind")],
  theme: {
    extend: {
      colors: {
        background: "#fff9e3",
        foreground: "#081126",
        card: "#fff8e7",
        muted: "#f6eecf",
        "muted-foreground": "rgba(0, 0, 0, 0.6)",
        primary: "#081126",
        accent: "#ea7a53",
        border: "rgba(0, 0, 0, 0.1)",
        success: "#16a34a",
        destructive: "#dc2626",
        subscription: "#8fd1bd",
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
