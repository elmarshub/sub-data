import { formatSubscriptionDateTime } from "@/lib/utils";
import { Text, View } from "react-native";
import { getRenewalCopy } from "./subscriptionStatus";

interface SubscriptionInfoSectionProps {
  subscription: Subscription;
}

const SubscriptionInfoSection = ({
  subscription,
}: SubscriptionInfoSectionProps) => {
  const isCancelled = subscription.status === "cancelled";
  const renewal = getRenewalCopy(subscription.renewalDate);

  return (
    <View className="detail-section">
      <Text className="detail-section-title">Details</Text>

      <View className="detail-row">
        <Text className="detail-row-label">Category</Text>
        <Text className="detail-row-value">
          {subscription.category?.trim() ||
            subscription.plan?.trim() ||
            "Not provided"}
        </Text>
      </View>

      <View className="detail-row">
        <Text className="detail-row-label">Payment method</Text>
        <Text className="detail-row-value">
          {subscription.paymentMethod?.trim() || "Not provided"}
        </Text>
      </View>

      <View className="detail-row">
        <Text className="detail-row-label">Started</Text>
        <Text className="detail-row-value">
          {formatSubscriptionDateTime(subscription.startDate)}
        </Text>
      </View>

      <View className="detail-row">
        <Text className="detail-row-label">Renewal date</Text>
        <Text className="detail-row-value">
          {formatSubscriptionDateTime(subscription.renewalDate)}
        </Text>
      </View>

      {!isCancelled ? (
        <View className="detail-row">
          <Text className="detail-row-label">Status</Text>
          <Text className="detail-row-value" style={{ color: renewal.color }}>
            {renewal.label}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default SubscriptionInfoSection;
