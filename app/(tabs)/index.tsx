import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import { formatCurrency } from "@/lib/utils";
import { useSubscriptions } from "@/store/subscriptions";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const { user } = useUser();
  const { subscriptions, addSubscription } = useSubscriptions();
  const [expandedSunscriptionId, setExpandedSunscriptionId] = useState<
    string | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <FlatList
        ListHeaderComponent={() => (
          <>
            {/* header fro user and add button */}
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
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
              </View>

              <Pressable onPress={() => setModalVisible(true)}>
                <Image
                  source={icons.add}
                  className="home-add-icon border border-gray-400 rounded-full p-2"
                />
              </Pressable>
            </View>

            {/* balance and next sub date */}
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            {/* upcoming subscriptions */}
            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
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

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSunscriptionId === item.id}
            onPress={() => {
              const isExpanded = expandedSunscriptionId === item.id;
              setExpandedSunscriptionId(isExpanded ? null : item.id);
              posthog.capture("subscription_card_toggled", {
                subscription_id: item.id,
                is_expanded: !isExpanded,
              });
            }}
          />
        )}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        extraData={expandedSunscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={(sub) => {
          addSubscription(sub);
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
