import { images } from "@/constants/images";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const DISPLAY_DURATION_MS = 1100;

interface WelcomeScreenProps {
  onFinish: () => void;
}

const WelcomeScreen = ({ onFinish }: WelcomeScreenProps) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    scale.value = withSequence(
      withTiming(1.05, { duration: 350 }),
      withTiming(1, { duration: 150 }),
    );

    const timer = setTimeout(onFinish, DISPLAY_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onFinish, opacity, scale]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <SafeAreaView className="welcome-safe-area">
      <Image
        source={images.splashPattern}
        className="welcome-pattern"
        resizeMode="cover"
      />
      <Animated.View style={logoStyle} className="items-center">
        <View className="welcome-logo-wrap">
          <Text className="welcome-logo-text">S</Text>
        </View>
        <Text className="welcome-wordmark">Subly</Text>
        <Text className="welcome-tagline">Every subscription, one place.</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
