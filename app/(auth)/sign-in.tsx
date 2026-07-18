import AuthBrandBlock from "@/components/AuthBrandBlock";
import AuthField from "@/components/AuthField";
import { posthog } from "@/lib/posthog";
import {
  canResendMfa,
  getMfaSubtitle,
  resolveTaskDestination,
  selectMfaFactor,
} from "@/lib/utils";
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
  const [formError, setFormError] = React.useState<string | null>(null);
  const [mfaStrategy, setMfaStrategy] = React.useState<string | null>(null);

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
    setFormError(null);

    try {
      const { error } = await signIn.password({
        emailAddress,
        password,
      });
      if (error) {
        const msg =
          error.longMessage ||
          error.message ||
          "Sign-in failed. Please try again.";
        setFormError(msg);
        return;
      }

      if (signIn.status === "complete") {
        posthog.capture("sign_in_completed", {
          authentication_method: "password",
        });
        await signIn.finalize({
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

  const handleVerify = async () => {
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
        posthog.capture("sign_in_completed", {
          authentication_method: mfaStrategy ?? "email_code",
        });
        await signIn.finalize({
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

  const isLoading = fetchStatus === "fetching";

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
                    setCode("");
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
