import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import SubscriptionFormModal from "@/components/subscription/SubscriptionFormModal";
import UpcomingSubscriptionCard from "@/components/subscription/UpcomingSubscriptionCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import {
  getMonthlyTotal,
  getNextRenewalDate,
  getUpcomingRenewals,
} from "@/lib/subscriptions";
import { formatCurrency } from "@/lib/utils";
import { useSubscriptions } from "@/store/subscriptions";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const { user } = useUser();
  const { subscriptions, addSubscription } = useSubscriptions();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const monthlyTotal = useMemo(
    () => getMonthlyTotal(subscriptions),
    [subscriptions],
  );
  const nextRenewalDate = useMemo(
    () => getNextRenewalDate(subscriptions),
    [subscriptions],
  );
  const upcomingRenewals = useMemo(
    () => getUpcomingRenewals(subscriptions),
    [subscriptions],
  );

  const openSubscription = useCallback(
    (id: string) => {
      router.push(`/subscriptions/${id}`);
    },
    [router],
  );

  const renderHeader = useCallback(
    () => (
      <>
        <View className="home-header">
          <Pressable
            className="home-user"
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel="Open your profile"
          >
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
              className="home-avatar"
            />
            <Text className="home-user-name capitalize">
              {user?.username ||
                user?.firstName ||
                user?.fullName ||
                (user?.primaryEmailAddress?.emailAddress
                  ? user.primaryEmailAddress.emailAddress.split("@")[0]
                  : "User")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Add subscription"
          >
            <Image
              source={icons.add}
              className="home-add-icon border border-gray-400 rounded-full p-2"
            />
          </Pressable>
        </View>

        <View className="home-balance-card">
          <Text className="home-balance-label">Balance</Text>

          <View className="home-balance-row">
            <Text
              className="home-balance-amount"
              accessibilityLabel={`Monthly spend ${formatCurrency(monthlyTotal)}`}
            >
              {formatCurrency(monthlyTotal)}
            </Text>
            {nextRenewalDate ? (
              <Text
                className="home-balance-date"
                accessibilityLabel={`Next renewal date ${dayjs(nextRenewalDate).format("MMMM D")}`}
              >
                {dayjs(nextRenewalDate).format("MM/DD")}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="mb-5">
          <ListHeading
            title="Upcoming"
            onViewAllPress={() => router.push("/upcoming")}
          />
          <FlatList
            data={upcomingRenewals}
            renderItem={({ item }) => (
              <UpcomingSubscriptionCard
                {...item}
                onPress={() => openSubscription(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="home-empty-state">
                No upcoming renewals yet.
              </Text>
            }
          />
        </View>

        <ListHeading
          title="All Subscriptions"
          onViewAllPress={() => router.push("/subscriptions")}
        />
      </>
    ),
    [user, monthlyTotal, nextRenewalDate, upcomingRenewals, router, openSubscription],
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <FlatList
        ListHeaderComponent={renderHeader}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            onPress={() => {
              posthog.capture("subscription_card_pressed", {
                subscription_id: item.id,
                screen: "home",
              });
              openSubscription(item.id);
            }}
          />
        )}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      />

      <SubscriptionFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(sub) => {
          addSubscription(sub);
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
