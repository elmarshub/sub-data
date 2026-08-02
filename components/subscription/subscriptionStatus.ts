import { colors } from "@/constants/theme";
import dayjs from "dayjs";

export const STATUS_COLORS: Record<string, string> = {
  active: colors.success,
  paused: colors.mutedForeground,
  cancelled: colors.destructive,
};

export const getRenewalCopy = (renewalDate?: string) => {
  if (!renewalDate) {
    return { label: "Not provided", color: colors.mutedForeground };
  }

  const days = dayjs(renewalDate)
    .startOf("day")
    .diff(dayjs().startOf("day"), "day");

  if (days < 0) {
    return { label: `Overdue by ${Math.abs(days)}d`, color: colors.destructive };
  }
  if (days === 0) {
    return { label: "Renews today", color: colors.destructive };
  }
  if (days <= 7) {
    return { label: `Renews in ${days}d`, color: colors.accent };
  }
  return { label: `Renews in ${days}d`, color: colors.success };
};
