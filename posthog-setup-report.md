# PostHog post-wizard report

PostHog has been integrated into the Expo React Native app using `posthog-react-native`. The SDK is initialized from `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` and `EXPO_PUBLIC_POSTHOG_HOST`, is wrapped at the Expo Router root, identifies signed-in Clerk users by their stable Clerk ID, tracks Expo Router screens, and retains default lifecycle, session, and touch autocapture.

Custom product events and exception capture were added around completed authentication, subscription-card interactions, and sign-out. Event properties intentionally exclude email addresses, names, and other user-entered PII. Clerk user data is stored as person properties through `identify()`.

| Event name | Description | File |
| --- | --- | --- |
| `sign_in_completed` | Captures completion of password or multi-factor sign-in, including the authentication method. | `app/(auth)/sign-in.tsx` |
| `sign_up_completed` | Captures successful account creation after email verification. | `app/(auth)/sign-up.tsx` |
| `subscription_card_toggled` | Captures expansion or collapse of a subscription summary card. | `app/(tabs)/index.tsx` |
| `user_signed_out` | Captures a completed user sign-out action. | `app/(tabs)/settings.tsx` |

## Next steps

A [PostHog dashboard](https://us.posthog.com/project/518716/dashboard/1870265) named **Analytics basics (wizard)** has been created.

Saved insights were not added yet because the new custom event names have not arrived in the project's data schema. Launch the updated app and complete each tracked action, then add trends or funnels using the events above once they appear in PostHog.

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names added to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

An agent skill folder remains in the project at `.claude/skills/integration-expo`. It provides current integration guidance for future work with Claude Code.
