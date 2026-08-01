import AuthBrandBlock from "@/components/AuthBrandBlock";
import AuthField from "@/components/AuthField";
import { posthog } from "@/lib/posthog";
import { canResendMfa, getMfaSubtitle, selectMfaFactor } from "@/lib/utils";
import { MfaCodeValues, SignInValues, mfaCodeSchema, signInSchema } from "@/schemas/auth";
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

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [mfaStrategy, setMfaStrategy] = React.useState<string | null>(null);

  const {
    control: signInControl,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { emailAddress: "", password: "" },
  });

  const {
    control: mfaControl,
    handleSubmit: handleMfaSubmit,
    reset: resetMfaForm,
    formState: { errors: mfaErrors },
  } = useForm<MfaCodeValues>({
    resolver: zodResolver(mfaCodeSchema),
    defaultValues: { code: "" },
  });

  const isLoading = fetchStatus === "fetching";

  const onSignInValid = async ({ emailAddress, password }: SignInValues) => {
    setFormError(null);

    try {
      const { error } = await signIn.password({ emailAddress, password });
      if (error) {
        const msg =
          error.longMessage ||
          error.message ||
          "Sign-in failed. Please try again.";
        setFormError(msg);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        posthog.capture("sign_in_completed", {
          authentication_method: "password",
        });
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        const factor = selectMfaFactor(signIn.supportedSecondFactors);
        if (factor) {
          setMfaStrategy(factor.strategy);
          if (factor.strategy === "email_code") {
            const { error: sendError } = await signIn.mfa.sendEmailCode();
            if (sendError) {
              setFormError(
                sendError.longMessage ||
                  sendError.message ||
                  "Failed to send verification code.",
              );
              setMfaStrategy(null);
              return;
            }
          } else if (factor.strategy === "phone_code") {
            const { error: sendError } = await signIn.mfa.sendPhoneCode();
            if (sendError) {
              setFormError(
                sendError.longMessage ||
                  sendError.message ||
                  "Failed to send verification code.",
              );
              setMfaStrategy(null);
              return;
            }
          }
        } else {
          setFormError("No supported verification method available.");
        }
      } else {
        setFormError("Sign-in could not be completed. Please try again.");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign-in failed");
      posthog.captureException(error, { flow: "sign_in" });
      setFormError(error.message);
    }
  };

  const onVerifyValid = async ({ code }: MfaCodeValues) => {
    setFormError(null);
    try {
      let verifyError: { longMessage?: string; message?: string } | null = null;
      if (mfaStrategy === "phone_code") {
        ({ error: verifyError } = await signIn.mfa.verifyPhoneCode({ code }));
      } else if (mfaStrategy === "totp") {
        ({ error: verifyError } = await signIn.mfa.verifyTOTP({ code }));
      } else if (mfaStrategy === "backup_code") {
        ({ error: verifyError } = await signIn.mfa.verifyBackupCode({ code }));
      } else {
        ({ error: verifyError } = await signIn.mfa.verifyEmailCode({ code }));
      }
      if (verifyError) {
        const msg =
          verifyError.longMessage ||
          verifyError.message ||
          "Verification failed. Please try again.";
        setFormError(msg);
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize();
        posthog.capture("sign_in_completed", {
          authentication_method: mfaStrategy ?? "email_code",
        });
      } else {
        setFormError("Verification could not be completed. Please try again.");
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Sign-in verification failed");
      posthog.captureException(error, { flow: "sign_in_verification" });
      setFormError(error.message);
    }
  };

  if (
    signIn.status === "needs_client_trust" ||
    signIn.status === "needs_second_factor"
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
              title="Verify your account"
              subtitle={getMfaSubtitle(mfaStrategy)}
            />
            <View className="auth-card">
              <View className="auth-form">
                {formError ? (
                  <Text className="auth-error">{formError}</Text>
                ) : null}
                <Controller
                  control={mfaControl}
                  name="code"
                  render={({ field: { value, onChange } }) => (
                    <AuthField
                      label="Verification code"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter 6-digit code"
                      error={mfaErrors.code?.message || errors.fields.code?.message}
                      keyboardType="numeric"
                    />
                  )}
                />
                <Pressable
                  className={`auth-button ${isLoading && "auth-button-disabled"}`}
                  onPress={handleMfaSubmit(onVerifyValid)}
                  disabled={isLoading}
                >
                  <Text className="auth-button-text">
                    {isLoading ? "Verifying..." : "Verify"}
                  </Text>
                </Pressable>
                {canResendMfa(mfaStrategy) ? (
                  <Pressable
                    className="auth-secondary-button"
                    onPress={async () => {
                      setFormError(null);
                      const { error: sendError } =
                        mfaStrategy === "phone_code"
                          ? await signIn.mfa.sendPhoneCode()
                          : await signIn.mfa.sendEmailCode();
                      if (sendError) {
                        setFormError(
                          sendError.longMessage ||
                            sendError.message ||
                            "Failed to resend verification code.",
                        );
                      }
                    }}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  className="auth-secondary-button"
                  onPress={() => {
                    resetMfaForm();
                    setMfaStrategy(null);
                    setFormError(null);
                    signIn.reset();
                  }}
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
              {formError ? (
                <Text className="auth-error">{formError}</Text>
              ) : null}
              <Controller
                control={signInControl}
                name="emailAddress"
                render={({ field: { value, onChange } }) => (
                  <AuthField
                    label="Email address"
                    value={value}
                    onChangeText={onChange}
                    placeholder="you@example.com"
                    error={
                      signInErrors.emailAddress?.message ||
                      errors.fields.identifier?.message
                    }
                    keyboardType="email-address"
                  />
                )}
              />
              <Controller
                control={signInControl}
                name="password"
                render={({ field: { value, onChange } }) => (
                  <AuthField
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter your password"
                    error={
                      signInErrors.password?.message ||
                      errors.fields.password?.message
                    }
                    secureTextEntry
                  />
                )}
              />
              <Pressable
                className={`auth-button ${isLoading && "auth-button-disabled"}`}
                onPress={handleSignInSubmit(onSignInValid)}
                disabled={isLoading}
              >
                <Text className="auth-button-text">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </Pressable>

              <View className="items-center">
                <Link href="/(auth)/forgot-password">
                  <Text className="auth-link">Forgot password?</Text>
                </Link>
              </View>
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
