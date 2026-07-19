import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { create } from "zustand";

interface SubscriptionsState {
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
}

export const useSubscriptions = create<SubscriptionsState>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  addSubscription: (sub) =>
    set((state) => ({ subscriptions: [sub, ...state.subscriptions] })),
}));
