import dayjs from "dayjs";

// a generous cap on cycle-advance iterations (~100 years of monthly cycles)
// so a corrupt renewalDate can't spin the loop below forever.
const MAX_CYCLE_ADVANCES = 1200;

const monthlyEquivalent = (sub: Subscription): number => {
  if (sub.billing === "Yearly") return sub.price / 12;
  return sub.price;
};

export const getMonthlyTotal = (subscriptions: Subscription[]): number =>
  subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((sum, sub) => sum + monthlyEquivalent(sub), 0);

// subscriptions never auto-renew locally (no backend cron yet), so a still-
// active subscription's stored renewalDate can drift into the past. This
// advances it forward by whole billing cycles for display/sort purposes only
const getEffectiveRenewalDate = (sub: Subscription): dayjs.Dayjs | null => {
  if (!sub.renewalDate) return null;

  let renewal = dayjs(sub.renewalDate);
  if (!renewal.isValid()) return null;

  const today = dayjs().startOf("day");
  const unit = sub.billing === "Yearly" ? "year" : "month";

  let advances = 0;
  while (
    renewal.startOf("day").isBefore(today) &&
    advances < MAX_CYCLE_ADVANCES
  ) {
    renewal = renewal.add(1, unit);
    advances += 1;
  }

  return renewal;
};

export const getNextRenewalDate = (
  subscriptions: Subscription[],
): string | null => {
  const upcoming = subscriptions
    .filter((sub) => sub.status === "active")
    .map((sub) => getEffectiveRenewalDate(sub))
    .filter((date): date is dayjs.Dayjs => date !== null)
    .sort((a, b) => a.valueOf() - b.valueOf());

  return upcoming[0]?.toISOString() ?? null;
};

export const getUpcomingRenewals = (
  subscriptions: Subscription[],
  count = 3,
): UpcomingSubscription[] => {
  const today = dayjs().startOf("day");

  return subscriptions
    .filter((sub) => sub.status === "active")
    .map((sub): UpcomingSubscription | null => {
      const effectiveRenewal = getEffectiveRenewalDate(sub);
      if (!effectiveRenewal) return null;

      return {
        id: sub.id,
        iconKey: sub.iconKey,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: effectiveRenewal.diff(today, "day"),
      };
    })
    .filter((sub): sub is UpcomingSubscription => sub !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, count);
};
