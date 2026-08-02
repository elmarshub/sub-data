import WelcomeScreen from "@/components/WelcomeScreen";
import "@/global.css";
import { getHasLaunchedBefore, setHasLaunchedBefore } from "@/lib/appLaunch";
import { isPostHogConfigured, posthog } from "@/lib/posthog";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname, useRouter } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { user } = useUser();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const previousPathname = useRef<string | undefined>(undefined);
  const isFirstLaunchRef = useRef(false);

  const [fontsLoaded, error] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  const [hasLaunchedBefore, setHasLaunchedBeforeState] = useState<
    boolean | null
  >(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    getHasLaunchedBefore()
      .then(setHasLaunchedBeforeState)
      .catch(() => setHasLaunchedBeforeState(false));
  }, []);

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  useEffect(() => {
    if (error) {
      console.error("Failed to load fonts:", error);
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        ...(user.username ? { username: user.username } : {}),
      });
    } else {
      posthog.reset();
    }
  }, [user]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
      });
      previousPathname.current = pathname;
    }
  }, [pathname]);

  // First-ever launch lands new visitors on Sign Up instead of the default
  // Sign In. Fires once, imperatively, right after the welcome screen closes.
  useEffect(() => {
    if (welcomeDismissed && isFirstLaunchRef.current && !isSignedIn) {
      isFirstLaunchRef.current = false;
      router.replace("/(auth)/sign-up");
    }
  }, [welcomeDismissed, isSignedIn, router]);

  const handleWelcomeFinish = useCallback(async () => {
    if (!hasLaunchedBefore) {
      isFirstLaunchRef.current = true;
      await setHasLaunchedBefore();
    }
    setWelcomeDismissed(true);
  }, [hasLaunchedBefore]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-primary">
          Failed to load fonts. Please restart the app.
        </Text>
      </View>
    );
  }

  if (!fontsLoaded || !authLoaded || hasLaunchedBefore === null) {
    return null;
  }

  if (!welcomeDismissed) {
    return <WelcomeScreen onFinish={handleWelcomeFinish} />;
  }

  const stack = (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    />
  );

  if (!isPostHogConfigured) {
    return stack;
  }

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{ captureScreens: false, captureTouches: true }}
    >
      {stack}
    </PostHogProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootLayoutContent />
    </ClerkProvider>
  );
}
