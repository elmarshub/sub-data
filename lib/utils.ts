import dayjs from "dayjs";

export function formatCurrency(value: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error("Failed to format currency:", error);
    const formattedValue = value.toFixed(2);
    return `$${formattedValue}`;
  }
}

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parseDate = dayjs(value);
  return parseDate.isValid() ? parseDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Not provided";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const MFA_SUBTITLES: Record<string, string> = {
  email_code:
    "For your security, we need to verify it's you. Enter the code sent to your email.",
  phone_code:
    "For your security, we need to verify it's you. Enter the code sent to your phone.",
  totp: "For your security, we need to verify it's you. Enter the code from your authenticator app.",
  backup_code:
    "For your security, we need to verify it's you. Enter one of your backup codes.",
};

export function getMfaSubtitle(strategy: string | null): string {
  return MFA_SUBTITLES[strategy ?? ""] ?? MFA_SUBTITLES.email_code;
}

export function canResendMfa(strategy: string | null): boolean {
  return strategy === "email_code" || strategy === "phone_code";
}

export function selectMfaFactor<T extends { strategy: string }>(
  factors: T[],
): T | undefined {
  return factors.find((f) => f.strategy !== "email_link");
}
