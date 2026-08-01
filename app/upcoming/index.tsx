import BackButton from "@/components/BackButton";
import CollapsibleSearch from "@/components/CollapsibleSearch";
import UpcomingSubscriptionCard from "@/components/subscription/UpcomingSubscriptionCard";
import "@/global.css";
import { getUpcomingRenewals } from "@/lib/subscriptions";
import { useSubscriptions } from "@/store/subscriptions";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UpcomingScreen = () => {
  const { subscriptions } = useSubscriptions();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const upcoming = useMemo(
    () => getUpcomingRenewals(subscriptions, subscriptions.length),
    [subscriptions],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return upcoming;
    return upcoming.filter((sub) => sub.name.toLowerCase().includes(q));
  }, [search, upcoming]);

  return (
    <SafeAreaView className="detail-safe-area">
      <View className="detail-header">
        <BackButton onPress={() => router.back()} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 pb-16 pt-4"
          ListHeaderComponent={
            <CollapsibleSearch
              title="Upcoming Renewals"
              value={search}
              onChangeText={setSearch}
              placeholder="Search upcoming..."
            />
          }
          renderItem={({ item }) => (
            <UpcomingSubscriptionCard
              {...item}
              fullWidth
              onPress={() => router.push(`/subscriptions/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListEmptyComponent={
            <Text className="home-empty-state">No upcoming renewals.</Text>
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default UpcomingScreen;
