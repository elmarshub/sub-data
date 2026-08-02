import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { create } from "zustand";

interface SubscriptionsState {
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
  updateSubscription: (id: string, changes: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  cancelSubscription: (id: string) => void;
}

export const useSubscriptions = create<SubscriptionsState>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,

  addSubscription: (sub) =>
    set((state) => ({ subscriptions: [sub, ...state.subscriptions] })),

  updateSubscription: (id, changes) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...changes } : sub,
      ),
    })),

  deleteSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    })),

  cancelSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, status: "cancelled" } : sub,
      ),
    })),
}));
