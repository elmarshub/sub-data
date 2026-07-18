import AuthBrandBlock from "@/components/AuthBrandBlock";
import AuthField from "@/components/AuthField";
import { posthog } from "@/lib/posthog";
import { resolveTaskDestination } from "@/lib/utils";
import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [localErrors, setLocalErrors] = React.useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  const validateForm = () => {
    const errs: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    if (!username.trim()) {
      errs.username = "Username is required";
    } else if (username.trim().length < 3) {
      errs.username = "Username must be at least 3 characters";
    }
    if (!emailAddress.trim()) {
      errs.email = "Email is required";
    } else if (!EMAIL_REGEX.test(emailAddress)) {
      errs.email = "Enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      errs.confirmPassword = "Passwords do not match";
    }
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setFormError(null);

    try {
      const { error } = await signUp.password({
        emailAddress,
        password,
        username,
      });
      if (error) {
        const msg =
          error.longMessage ||
          error.message ||
          "Sign-up failed. Please try again.";
        setFormError(msg);
        return;
      }
      await signUp.verifications.sendEmailCode();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setFormError(msg);
    }
  };

  const handleVerify = async () => {
    setFormError(null);
    try {
      await signUp.verifications.verifyEmailCode({ code });
      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            const dest = resolveTaskDestination(session.currentTask);
            const url = decorateUrl(dest);
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url as Href);
            }
          },
        });
        posthog.capture("sign_up_completed", {
          authentication_method: "email_verification",
        });
      } else {
        setFormError("Sign-up could not be completed. Please try again.");
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Sign-up verification failed");
      posthog.captureException(error, { flow: "sign_up_verification" });
      setFormError(error.message);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const isLoading = fetchStatus === "fetching";

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="auth-screen"
        >
          <ScrollView
            className="auth-scroll"
            contentContainerClassName="auth-content"
            keyboardShouldPersistTaps="handled"
          >
            <AuthBrandBlock
              title="Verify your email"
              subtitle="We sent a code to your inbox. Enter it below to confirm your account."
            />
            <View className="auth-card">
              <View className="auth-form">
                {formError ? (
                  <Text className="auth-error">{formError}</Text>
                ) : null}
                <AuthField
                  label="Verification code"
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter 6-digit code"
                  error={errors.fields.code?.message}
                  keyboardType="numeric"
                />
                <Pressable
                  className={`auth-button ${(!code || isLoading) && "auth-button-disabled"}`}
                  onPress={handleVerify}
                  disabled={!code || isLoading}
                >
                  <Text className="auth-button-text">
                    {isLoading ? "Verifying..." : "Verify Email"}
                  </Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signUp.verifications.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          <AuthBrandBlock
            title="Create your account"
            subtitle="Start tracking every subscription in one place. It only takes a minute."
          />
          <View className="auth-card">
            <View className="auth-form">
              {formError ? (
                <Text className="auth-error">{formError}</Text>
              ) : null}
              <AuthField
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
                error={localErrors.username || errors.fields.username?.message}
                autoCapitalize="none"
              />
              <AuthField
                label="Email address"
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="you@example.com"
                error={localErrors.email || errors.fields.emailAddress?.message}
                keyboardType="email-address"
              />
              <AuthField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                error={localErrors.password || errors.fields.password?.message}
                secureTextEntry
              />
              <AuthField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                error={localErrors.confirmPassword}
                secureTextEntry
              />
              <Pressable
                className={`auth-button ${(!username || !emailAddress || !password || !confirmPassword || isLoading) && "auth-button-disabled"}`}
                onPress={handleSubmit}
                disabled={
                  !username ||
                  !emailAddress ||
                  !password ||
                  !confirmPassword ||
                  isLoading
                }
              >
                <Text className="auth-button-text">
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account? </Text>
            <Link href="/(auth)/sign-in">
              <Text className="auth-link">Sign in</Text>
            </Link>
          </View>

          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
