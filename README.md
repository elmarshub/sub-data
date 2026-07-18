# Subly

A subscription tracking app built with Expo, React Native, and TypeScript. Track your subscriptions, get insights on spending, and manage upcoming renewals.

## Tech Stack

- **Expo Router** — file-based navigation
- **Clerk** — authentication
- **PostHog** — analytics
- **NativeWind** — Tailwind CSS for React Native
- **React Native Reanimated** — animations

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables — create a `.env` file with:

   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN=your_posthog_token
   EXPO_PUBLIC_POSTHOG_HOST=your_posthog_host
   ```

3. Start the app

   ```bash
   npx expo start
   ```
