import AuthBrandBlock from "@/components/AuthBrandBlock";
import AuthField from "@/components/AuthField";
import { posthog } from "@/lib/posthog";
import { getAuthErrorMessage } from "@/lib/utils";
import { MfaCodeValues, SignUpValues, mfaCodeSchema, signUpSchema } from "@/schemas/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    control: signUpControl,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpErrors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      emailAddress: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    control: verifyControl,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
  } = useForm<MfaCodeValues>({
    resolver: zodResolver(mfaCodeSchema),
    defaultValues: { code: "" },
  });

  const isLoading = fetchStatus === "fetching";

  const onSignUpValid = async ({
    username,
    emailAddress,
    password,
  }: SignUpValues) => {
    setFormError(null);

    try {
      const { error } = await signUp.password({
        emailAddress,
        password,
        username,
      });
      if (error) {
        setFormError(getAuthErrorMessage(error, "Sign-up failed. Please try again."));
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setFormError(
          getAuthErrorMessage(sendError, "Failed to send verification code."),
        );
      }
    } catch (err) {
      setFormError(getAuthErrorMessage(err, "An unexpected error occurred."));
    }
  };

  const onVerifyValid = async ({ code }: MfaCodeValues) => {
    setFormError(null);
    try {
      const { error: verifyError } =
        await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        setFormError(
          getAuthErrorMessage(verifyError, "That code didn't work. Please try again."),
        );
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize();
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
      setFormError(
        getAuthErrorMessage(err, "Verification failed. Please try again."),
      );
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

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
                <Controller
                  control={verifyControl}
                  name="code"
                  render={({ field: { value, onChange } }) => (
                    <AuthField
                      label="Verification code"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter 6-digit code"
                      error={
                        verifyErrors.code?.message || errors.fields.code?.message
                      }
                      keyboardType="numeric"
                    />
                  )}
                />
                {formError ? (
                  <Text className="auth-error">{formError}</Text>
                ) : null}
                <Pressable
                  className={`auth-button ${isLoading ? "auth-button-disabled" : ""}`}
                  onPress={handleVerifySubmit(onVerifyValid)}
                  disabled={isLoading}
                >
                  <Text className="auth-button-text">
                    {isLoading ? "Verifying..." : "Verify Email"}
                  </Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  onPress={async () => {
                    setFormError(null);
                    const { error: sendError } =
                      await signUp.verifications.sendEmailCode();
                    if (sendError) {
                      setFormError(
                        getAuthErrorMessage(
                          sendError,
                          "Failed to resend verification code.",
                        ),
                      );
                    }
                  }}
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
              <Controller
                control={signUpControl}
                name="username"
                render={({ field: { value, onChange } }) => (
                  <AuthField
                    label="Username"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Choose a username"
                    error={
                      signUpErrors.username?.message ||
                      errors.fields.username?.message
                    }
                    autoCapitalize="none"
                  />
                )}
              />
              <Controller
                control={signUpControl}
                name="emailAddress"
                render={({ field: { value, onChange } }) => (
                  <AuthField
                    label="Email address"
                    value={value}
                    onChangeText={onChange}
                    placeholder="you@example.com"
                    error={
                      signUpErrors.emailAddress?.message ||
                      errors.fields.emailAddress?.message
                    }
                    keyboardType="email-address"
                  />
                )}
              />
              <Controller
                control={signUpControl}
                name="password"
                render={({ field: { value, onChange } }) => (
                  <AuthField
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    placeholder="At least 8 characters"
                    error={
                      signUpErrors.password?.message ||
                      errors.fields.password?.message
                    }
                    secureTextEntry
                  />
                )}
              />
              <Controller
                control={signUpControl}
                name="confirmPassword"
                render={({ field: { value, onChange } }) => (
                  <AuthField
                    label="Confirm password"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Re-enter your password"
                    error={signUpErrors.confirmPassword?.message}
                    secureTextEntry
                  />
                )}
              />
              {formError ? (
                <Text className="auth-error">{formError}</Text>
              ) : null}
              <Pressable
                className={`auth-button ${isLoading ? "auth-button-disabled" : ""}`}
                onPress={handleSignUpSubmit(onSignUpValid)}
                disabled={isLoading}
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
