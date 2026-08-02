import { getSubscriptionIcon } from "@/constants/icons";
import { formatCurrency, formatStatusLabel } from "@/lib/utils";
import { Image, Text, View } from "react-native";
import { STATUS_COLORS } from "./subscriptionStatus";

interface SubscriptionHeroProps {
  subscription: Subscription;
}

const SubscriptionHero = ({ subscription }: SubscriptionHeroProps) => (
  <View className="detail-hero">
    <Image
      source={getSubscriptionIcon(subscription.iconKey)}
      className="detail-icon"
    />
    <Text className="detail-name">{subscription.name}</Text>
    {subscription.plan ? (
      <Text className="detail-plan">{subscription.plan}</Text>
    ) : null}

    <Text className="detail-price">
      {formatCurrency(subscription.price, subscription.currency)}
    </Text>
    <Text className="detail-billing">{subscription.billing}</Text>

    <View className="detail-status-badge">
      <View
        className="sub-status-dot"
        style={{
          backgroundColor: STATUS_COLORS[subscription.status ?? "active"],
        }}
      />
      <Text className="detail-status-text">
        {formatStatusLabel(subscription.status)}
      </Text>
    </View>
  </View>
);

export default SubscriptionHero;
