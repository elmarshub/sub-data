import React from "react";
import { Pressable, Text, View } from "react-native";

const ListHeading = ({ title, onViewAllPress }: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      {onViewAllPress ? (
        <Pressable
          className="list-action"
          onPress={onViewAllPress}
          accessibilityRole="button"
          accessibilityLabel={`View all ${title.toLowerCase()}`}
        >
          <Text className="list-action-text">View All</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default ListHeading;
