import AuthBrandBlock from "@/components/AuthBrandBlock";
import AuthField from "@/components/AuthField";
import { useSignIn } from "@clerk/expo";
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

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [localErrors, setLocalErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errs: { email?: string; password?: string } = {};
    if (!emailAddress.trim()) {
      errs.email = "Email is required";
    } else if (!EMAIL_REGEX.test(emailAddress)) {
      errs.email = "Enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    }
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const { error } = await signIn.password({
        emailAddress,
        password,
      });
      if (error) {
        console.error(JSON.stringify(error, null, 2));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url as Href);
            }
          },
        });
      } else if (signIn.status === "needs_second_factor") {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
        }
      } else if (signIn.status === "needs_client_trust") {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
        }
      } else {
        console.error("Sign-in attempt not complete:", signIn);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
    }
  };

  const handleVerify = async () => {
    try {
      await signIn.mfa.verifyEmailCode({ code });
      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url as Href);
            }
          },
        });
      } else {
        console.error("Sign-in attempt not complete:", signIn);
      }
    } catch (err) {
      console.error("Verification error:", err);
    }
  };

  const isLoading = fetchStatus === "fetching";

  if (signIn.status === "needs_client_trust") {
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
              title="Verify your account"
              subtitle="For your security, we need to verify it's you. Enter the code sent to your email."
            />
            <View className="auth-card">
              <View className="auth-form">
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
                    {isLoading ? "Verifying..." : "Verify"}
                  </Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signIn.mfa.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signIn.reset()}
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
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
            title="Welcome back"
            subtitle="Sign in to manage your subscriptions and never miss a renewal."
          />
          <View className="auth-card">
            <View className="auth-form">
              <AuthField
                label="Email address"
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="you@example.com"
                error={localErrors.email || errors.fields.identifier?.message}
                keyboardType="email-address"
              />
              <AuthField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                error={localErrors.password || errors.fields.password?.message}
                secureTextEntry
              />
              <Pressable
                className={`auth-button ${(!emailAddress || !password || isLoading) && "auth-button-disabled"}`}
                onPress={handleSubmit}
                disabled={!emailAddress || !password || isLoading}
              >
                <Text className="auth-button-text">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Don&apos;t have an account? </Text>
            <Link href="/(auth)/sign-up">
              <Text className="auth-link">Sign up</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
