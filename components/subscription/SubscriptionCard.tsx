import { getSubscriptionIcon } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { formatCurrency } from "@/lib/utils";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { STATUS_COLORS } from "./subscriptionStatus";

const SubscriptionCard = ({
  name,
  price,
  currency,
  billing,
  iconKey,
  color,
  category,
  plan,
  status,
  onPress,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="sub-card"
      style={color ? { backgroundColor: color } : undefined}
      accessibilityRole="button"
      accessibilityLabel={`View ${name} details`}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={getSubscriptionIcon(iconKey)} className="sub-icon" />

          <View className="sub-copy">
            <View className="flex-row items-center gap-2">
              {status ? (
                <View
                  className="sub-status-dot"
                  style={{
                    backgroundColor: STATUS_COLORS[status] ?? colors.mutedForeground,
                  }}
                />
              ) : null}
              <Text numberOfLines={1} className="sub-title">
                {name}
              </Text>
            </View>

            <Text numberOfLines={1} className="sub-meta" ellipsizeMode="tail">
              {category?.trim() || plan?.trim() || ""}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default SubscriptionCard;
