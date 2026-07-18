import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

const AuthLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
