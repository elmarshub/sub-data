import SubscriptionCard from "@/components/SubscriptionCard";
import { colors } from "@/constants/theme";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import { useSubscriptions } from "@/store/subscriptions";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            <View>
              <Text className="sub-screen-title">Subscriptions</Text>
              <View className="sub-search-bar">
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search subscriptions..."
                  placeholderTextColor={colors.mutedForeground}
                  className="sub-search-input"
                  style={{ color: colors.primary }}
                />
              </View>
            </View>
          }
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() => {
                const isExpanded = expandedId === item.id;
                setExpandedId(isExpanded ? null : item.id);
                posthog.capture("subscription_card_toggled", {
                  subscription_id: item.id,
                  is_expanded: !isExpanded,
                  screen: "subscriptions",
                });
              }}
            />
          )}
          ListEmptyComponent={
            <Text className="home-empty-state">
              No subscriptions match &quot;{search}&quot;.
            </Text>
          }
          extraData={expandedId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-30"
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
