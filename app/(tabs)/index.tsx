import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 rounded-md bg-primary p-4 text-center text-white"
      >
        Get Started
      </Link>

      <Link
        href="/(auth)/sign-in"
        className="mt-4 rounded-md bg-primary p-4 text-center text-white"
      >
        Sign In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 rounded-md bg-primary p-4 text-center text-white"
      >
        Sign Up
      </Link>

      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
        className="mt-4 rounded-md bg-primary p-4 text-center text-white"
      >
        Subscriptions
      </Link>
    </SafeAreaView>
  );
}
