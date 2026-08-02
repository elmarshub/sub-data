import dayjs from "dayjs";

const monthlyEquivalent = (sub: Subscription): number => {
  if (sub.billing === "Yearly") return sub.price / 12;
  return sub.price;
};

export const getMonthlyTotal = (subscriptions: Subscription[]): number =>
  subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((sum, sub) => sum + monthlyEquivalent(sub), 0);

export const getNextRenewalDate = (
  subscriptions: Subscription[],
): string | null => {
  const today = dayjs().startOf("day");

  const upcoming = subscriptions
    .filter(
      (sub) =>
        sub.status === "active" &&
        sub.renewalDate &&
        !dayjs(sub.renewalDate).startOf("day").isBefore(today),
    )
    .sort(
      (a, b) =>
        dayjs(a.renewalDate).valueOf() - dayjs(b.renewalDate).valueOf(),
    );

  return upcoming[0]?.renewalDate ?? null;
};

export const getUpcomingRenewals = (
  subscriptions: Subscription[],
  count = 3,
): UpcomingSubscription[] => {
  const today = dayjs().startOf("day");

  return subscriptions
    .filter((sub) => sub.status === "active" && sub.renewalDate)
    .map((sub) => ({
      id: sub.id,
      iconKey: sub.iconKey,
      name: sub.name,
      price: sub.price,
      currency: sub.currency,
      daysLeft: dayjs(sub.renewalDate).startOf("day").diff(today, "day"),
    }))
    .filter((sub) => sub.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, count);
};
