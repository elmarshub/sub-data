export const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#f6eecf",
  Cloud: "#d4e8f5",
  Music: "#f5d4e8",
  Other: "#e8e8e8",
};
