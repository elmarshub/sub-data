import BackButton from "@/components/BackButton";
import SubscriptionActions from "@/components/subscription/SubscriptionActions";
import SubscriptionFormModal from "@/components/subscription/SubscriptionFormModal";
import SubscriptionHero from "@/components/subscription/SubscriptionHero";
import SubscriptionInfoSection from "@/components/subscription/SubscriptionInfoSection";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import { useSubscriptions } from "@/store/subscriptions";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    subscriptions,
    updateSubscription,
    cancelSubscription,
    deleteSubscription,
  } = useSubscriptions();
  const [editVisible, setEditVisible] = useState(false);

  const subscription = useMemo(
    () => subscriptions.find((sub) => sub.id === id),
    [subscriptions, id],
  );

  if (!subscription) {
    return (
      <SafeAreaView className="detail-safe-area">
        <View className="detail-header">
          <BackButton onPress={() => router.back()} />
        </View>
        <View className="detail-placeholder">
          <Text className="detail-placeholder-title">
            Subscription not found
          </Text>
          <Text className="detail-placeholder-subtitle">
            This subscription may have been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleTogglePause = () => {
    const nextStatus = subscription.status === "paused" ? "active" : "paused";
    updateSubscription(subscription.id, { status: nextStatus });
    posthog.capture("subscription_status_changed", {
      subscription_id: subscription.id,
      status: nextStatus,
    });
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel subscription?",
      `${subscription.name} will be marked as cancelled. You can still see it in your history.`,
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel subscription",
          style: "destructive",
          onPress: () => {
            cancelSubscription(subscription.id);
            posthog.capture("subscription_cancelled", {
              subscription_id: subscription.id,
              screen: "detail",
            });
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete subscription?",
      `This permanently removes ${subscription.name}. This can't be undone.`,
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSubscription(subscription.id);
            posthog.capture("subscription_deleted", {
              subscription_id: subscription.id,
            });
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="detail-safe-area">
      <View className="detail-header">
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView className="detail-scroll" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(350)}>
          <SubscriptionHero subscription={subscription} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(80)}>
          <SubscriptionInfoSection subscription={subscription} />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(350).delay(140)}>
          <SubscriptionActions
            status={subscription.status}
            onEdit={() => setEditVisible(true)}
            onTogglePause={handleTogglePause}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        </Animated.View>
      </ScrollView>

      <SubscriptionFormModal
        visible={editVisible}
        initialValues={subscription}
        onClose={() => setEditVisible(false)}
        onSubmit={(updated) => {
          updateSubscription(subscription.id, updated);
          setEditVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default SubscriptionDetails;
