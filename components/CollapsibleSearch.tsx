import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const EXPANDED_HEIGHT = 72;

interface CollapsibleSearchProps {
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const CollapsibleSearch = ({
  title,
  value,
  onChangeText,
  placeholder = "Search...",
}: CollapsibleSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);

  const open = () => {
    setIsExpanded(true);
    progress.value = withTiming(1, { duration: 220 });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const close = () => {
    progress.value = withTiming(0, { duration: 200 });
    onChangeText("");
    setIsExpanded(false);
  };

  const handleBlur = () => {
    if (!value.trim()) {
      close();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: progress.value * EXPANDED_HEIGHT,
    opacity: progress.value,
  }));

  return (
    <View>
      <View className="search-header-row">
        <Text className="sub-screen-title">{title}</Text>
        <Pressable
          onPress={isExpanded ? close : open}
          className="search-toggle-button"
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? "Close search" : "Search"}
        >
          <Ionicons
            name={isExpanded ? "close" : "search"}
            size={18}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <Animated.View
        style={animatedStyle}
        className="overflow-hidden"
        pointerEvents={isExpanded ? "auto" : "none"}
        accessibilityElementsHidden={!isExpanded}
        importantForAccessibility={isExpanded ? "auto" : "no-hide-descendants"}
      >
        <View className="sub-search-bar">
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={placeholder}
            className="sub-search-input"
            style={{ color: colors.primary }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

export default CollapsibleSearch;
