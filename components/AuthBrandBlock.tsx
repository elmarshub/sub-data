import React from "react";
import { Text, View } from "react-native";

interface AuthBrandBlockProps {
  title: string;
  subtitle: string;
}

const AuthBrandBlock = ({ title, subtitle }: AuthBrandBlockProps) => {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <View className="auth-logo-glow" />
          <Text className="auth-logo-mark-text">S</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Subly</Text>
          <Text className="auth-wordmark-sub mt-1">Subscription Tracker</Text>
        </View>
      </View>
      <Text className="auth-title">{title}</Text>
      <Text className="auth-subtitle">{subtitle}</Text>
    </View>
  );
};

export default AuthBrandBlock;
