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
