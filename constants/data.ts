import { icons } from "./icons";

export const tabs = [
  {
    title: "Home",
    icon: icons.home,
    name: "index",
  },
  {
    title: "Subscriptions",
    icon: icons.wallet,
    name: "subscriptions",
  },
  {
    title: "Insights",
    icon: icons.activity,
    name: "insights",
  },
  {
    title: "Settings",
    icon: icons.setting,
    name: "settings",
  },
] as const;
