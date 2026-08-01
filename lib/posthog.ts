import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;

const createNoopPostHog = () => {
  console.warn(
    "PostHog environment variables are not set — analytics is disabled.",
  );

  return {
    identify: () => {},
    reset: () => {},
    screen: () => {},
    capture: () => {},
    captureException: () => {},
  };
};

export const isPostHogConfigured = Boolean(projectToken && host);

export const posthog = isPostHogConfigured
  ? new PostHog(projectToken!, { host, captureAppLifecycleEvents: true })
  : (createNoopPostHog() as unknown as PostHog);
