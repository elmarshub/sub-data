import { getSubscriptionIcon } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import clsx from "clsx";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  iconKey,
  currency,
  onPress,
  fullWidth,
}: UpcomingSubscriptionCardProps) => {
  const cardClassName = clsx(fullWidth ? "upcoming-card-full" : "upcoming-card");

  const content = (
    <>
      <View className="upcoming-row">
        <Image source={getSubscriptionIcon(iconKey)} className="upcoming-icon" />
        <View className="upcoming-details">
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>

          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1 ? `${daysLeft} days left` : `Last day`}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </>
  );

  if (!onPress) {
    return <View className={cardClassName}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      className={cardClassName}
      accessibilityRole="button"
      accessibilityLabel={`View ${name} details`}
    >
      {content}
    </Pressable>
  );
};

export default UpcomingSubscriptionCard;
