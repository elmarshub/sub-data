import AuthBrandBlock from "@/components/AuthBrandBlock";
import AuthField from "@/components/AuthField";
import { posthog } from "@/lib/posthog";
import {
  ForgotPasswordRequestValues,
  ResetPasswordValues,
  forgotPasswordRequestSchema,
  resetPasswordSchema,
} from "@/schemas/auth";
import { useSignIn } from "@clerk/expo";
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

const ForgotPassword = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [stage, setStage] = React.useState<"request" | "reset">("request");
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    control: requestControl,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
  } = useForm<ForgotPasswordRequestValues>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { emailAddress: "" },
  });

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", password: "", confirmPassword: "" },
  });

  const isLoading = fetchStatus === "fetching";

  const onRequestValid = async ({ emailAddress }: ForgotPasswordRequestValues) => {
    setFormError(null);

    try {
      const { error: createError } = await signIn.create({
        identifier: emailAddress,
      });
      if (createError) {
        setFormError(
          createError.longMessage ||
            createError.message ||
            "Couldn't find an account with that email.",
        );
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setFormError(
          sendError.longMessage ||
            sendError.message ||
            "Failed to send reset code.",
        );
        return;
      }

      setStage("reset");
      posthog.capture("password_reset_requested");
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Reset request failed");
      posthog.captureException(error, { flow: "forgot_password" });
      setFormError(error.message);
    }
  };

  const onResetValid = async ({ code, password }: ResetPasswordValues) => {
    setFormError(null);

    try {
      const { error: verifyError } =
        await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (verifyError) {
        setFormError(
          verifyError.longMessage ||
            verifyError.message ||
            "That code didn't work. Please try again.",
        );
        return;
      }

      const { error: submitError } =
        await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (submitError) {
        setFormError(
          submitError.longMessage ||
            submitError.message ||
            "Couldn't reset your password. Please try again.",
        );
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        posthog.capture("password_reset_completed");
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Password reset failed");
      posthog.captureException(error, { flow: "forgot_password_reset" });
      setFormError(error.message);
    }
  };

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
            title={
              stage === "request" ? "Reset your password" : "Check your email"
            }
            subtitle={
              stage === "request"
                ? "Enter the email on your account and we'll send you a reset code."
                : "Enter the code we sent, and choose a new password."
            }
          />

          <View className="auth-card">
            <View className="auth-form">
              {formError ? (
                <Text className="auth-error">{formError}</Text>
              ) : null}

              {stage === "request" ? (
                <>
                  <Controller
                    control={requestControl}
                    name="emailAddress"
                    render={({ field: { value, onChange } }) => (
                      <AuthField
                        label="Email address"
                        value={value}
                        onChangeText={onChange}
                        placeholder="you@example.com"
                        error={
                          requestErrors.emailAddress?.message ||
                          errors.fields.identifier?.message
                        }
                        keyboardType="email-address"
                      />
                    )}
                  />
                  <Pressable
                    className={`auth-button ${isLoading && "auth-button-disabled"}`}
                    onPress={handleRequestSubmit(onRequestValid)}
                    disabled={isLoading}
                  >
                    <Text className="auth-button-text">
                      {isLoading ? "Sending..." : "Send Reset Code"}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Controller
                    control={resetControl}
                    name="code"
                    render={({ field: { value, onChange } }) => (
                      <AuthField
                        label="Reset code"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Enter 6-digit code"
                        error={
                          resetErrors.code?.message || errors.fields.code?.message
                        }
                        keyboardType="numeric"
                      />
                    )}
                  />
                  <Controller
                    control={resetControl}
                    name="password"
                    render={({ field: { value, onChange } }) => (
                      <AuthField
                        label="New password"
                        value={value}
                        onChangeText={onChange}
                        placeholder="At least 8 characters"
                        error={resetErrors.password?.message}
                        secureTextEntry
                      />
                    )}
                  />
                  <Controller
                    control={resetControl}
                    name="confirmPassword"
                    render={({ field: { value, onChange } }) => (
                      <AuthField
                        label="Confirm new password"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Re-enter your new password"
                        error={resetErrors.confirmPassword?.message}
                        secureTextEntry
                      />
                    )}
                  />
                  <Pressable
                    className={`auth-button ${isLoading && "auth-button-disabled"}`}
                    onPress={handleResetSubmit(onResetValid)}
                    disabled={isLoading}
                  >
                    <Text className="auth-button-text">
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Text>
                  </Pressable>
                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => {
                      setStage("request");
                      setFormError(null);
                    }}
                  >
                    <Text className="auth-secondary-button-text">
                      Use a different email
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Remembered your password? </Text>
            <Link href="/(auth)/sign-in">
              <Text className="auth-link">Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
