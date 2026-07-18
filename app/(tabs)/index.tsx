import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <Text className="text-7xl font-sans-extrabold">Home</Text>
      <Link
        href="/onboarding"
        className="mt-4 font-sans-bold rounded-md bg-primary p-4 text-center text-white"
      >
        Get Started
      </Link>

      <Link
        href="/(auth)/sign-in"
        className="mt-4 font-sans-bold rounded-md bg-primary p-4 text-center text-white"
      >
        Sign In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 font-sans-bold rounded-md bg-primary p-4 text-center text-white"
      >
        Sign Up
      </Link>
    </SafeAreaView>
  );
}
