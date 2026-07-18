import { useClerk, useUser } from "@clerk/expo";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [signOutError, setSignOutError] = React.useState<string | null>(null);

  const handleSignOut = async () => {
    setSignOutError(null);
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to sign out. Please try again.";
      setSignOutError(msg);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="flex-1">
        <Text className="text-2xl font-sans-extrabold text-primary mb-6">
          Settings
        </Text>

        <View className="flex-row items-center gap-4 mb-8">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : undefined}
            className="w-16 h-16 rounded-full bg-gray-200"
          />
          <View>
            <Text className="text-lg font-sans-bold text-primary capitalize">
              {user?.username ||
                user?.firstName ||
                user?.fullName ||
                (user?.primaryEmailAddress?.emailAddress
                  ? user.primaryEmailAddress.emailAddress.split("@")[0]
                  : "User")}
            </Text>
            <Text className="text-sm font-sans-regular text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        {signOutError ? (
          <Text className="text-sm text-destructive mb-2">{signOutError}</Text>
        ) : null}
        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          className={`bg-destructive rounded-xl py-4 items-center ${isSigningOut && "opacity-50"}`}
        >
          <Text className="text-white font-sans-bold text-base">
            {isSigningOut ? "Signing out..." : "Log Out"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
