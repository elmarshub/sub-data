import CollapsibleSearch from "@/components/CollapsibleSearch";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import { useSubscriptions } from "@/store/subscriptions";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.plan?.toLowerCase().includes(q),
    );
  }, [search, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <FlatList
          ListHeaderComponent={
            <CollapsibleSearch
              title="Subscriptions"
              value={search}
              onChangeText={setSearch}
              placeholder="Search subscriptions..."
            />
          }
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              onPress={() => {
                posthog.capture("subscription_card_pressed", {
                  subscription_id: item.id,
                  screen: "subscriptions",
                });
                router.push(`/subscriptions/${item.id}`);
              }}
            />
          )}
          ListEmptyComponent={
            <Text className="home-empty-state">
              {search.trim()
                ? `No subscriptions match "${search}".`
                : "No subscriptions yet."}
            </Text>
          }
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-30"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
