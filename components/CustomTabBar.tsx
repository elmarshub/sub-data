import { tabs } from "@/constants/data";
import { components } from "@/constants/theme";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabBarConfig = components.tabBar;
const INDICATOR_SIZE = 44;

interface TabLayout {
  x: number;
  width: number;
}

interface TabBarIconProps {
  icon: AppTab["icon"];
  title: string;
  focused: boolean;
  onPress: () => void;
  onLayout: (layout: TabLayout) => void;
}

const TabBarIcon = ({
  icon,
  title,
  focused,
  onPress,
  onLayout,
}: TabBarIconProps) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, {
      damping: 12,
      stiffness: 220,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    onLayout({ x, width });
  };

  return (
    <Pressable
      className="tabs-icon"
      onLayout={handleLayout}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={title}
    >
      <Animated.Image
        source={icon}
        resizeMode="contain"
        style={[{ width: 24, height: 24 }, animatedStyle]}
      />
    </Pressable>
  );
};

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const [tabLayouts, setTabLayouts] = useState<Record<number, TabLayout>>({});
  const translateX = useSharedValue(0);
  const hasPositioned = useRef(false);

  const activeLayout = tabLayouts[state.index];

  useEffect(() => {
    if (!activeLayout) return;
    const target = activeLayout.x + activeLayout.width / 2 - INDICATOR_SIZE / 2;
    translateX.value = hasPositioned.current
      ? withTiming(target, { duration: 260, easing: Easing.out(Easing.cubic) })
      : target;
    hasPositioned.current = true;
  }, [activeLayout, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={{
        position: "absolute",
        bottom: Math.max(insets.bottom, tabBarConfig.horizontalInset),
        left: tabBarConfig.horizontalInset,
        right: tabBarConfig.horizontalInset,
        height: tabBarConfig.height,
        borderRadius: tabBarConfig.radius,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <BlurView
        intensity={60}
        tint="dark"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "rgba(20, 25, 43, 0.55)" },
        ]}
      />

      <View className="tabs-bar" style={{ flex: 1 }}>
        {activeLayout ? (
          <Animated.View
            className="tabs-indicator"
            style={[
              indicatorStyle,
              { width: INDICATOR_SIZE, height: INDICATOR_SIZE },
            ]}
          />
        ) : null}

        {state.routes.map((route, index) => {
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;

          return (
            <TabBarIcon
              key={route.key}
              icon={tab.icon}
              title={tab.title}
              focused={focused}
              onLayout={(layout) =>
                setTabLayouts((prev) => ({ ...prev, [index]: layout }))
              }
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;
