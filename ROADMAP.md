# Subly — Product & Engineering Roadmap

> Living document. Update statuses as work lands. Goal: take Subly from a dummy-data prototype to a complete, portfolio-quality subscription management app, ready for TestFlight/Play internal testing and eventually public release.

**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## 0. Current State Snapshot (as of this audit)

- **Auth**: Clerk, working (`app/(auth)/sign-in.tsx`, `sign-up.tsx`).
- **State**: `store/subscriptions.ts` — zustand, in-memory only, seeded from `constants/data.ts` dummy data. Nothing persists.
- **Home**: `app/(tabs)/index.tsx` — balance card hardcoded (`HOME_BALANCE`), "Upcoming" carousel hardcoded (`UPCOMING_SUBSCRIPTIONS`), unrelated to real subscription list.
- **Subscriptions list**: `app/(tabs)/subscriptions.tsx` — search + inline expand, works against zustand store.
- **Subscription detail**: `app/subscriptions/[id].tsx` — placeholder stub, unlinked from any UI.
- **Insights**: `app/(tabs)/insights.tsx` — empty placeholder.
- **Settings**: `app/(tabs)/settings.tsx` — profile + sign out only.
- **Onboarding**: `app/onboarding.tsx` — 154-byte stub, unbuilt.
- **Create Subscription modal**: `components/CreateSubscriptionModal.tsx` — name/price/frequency/category only, no payment method, no icon picker, no edit mode.
- **Cleanup needed**: `context/subscriptions.tsx` is orphaned (migrated to zustand), delete it.
- **Analytics**: PostHog wired at root (`app/_layout.tsx`), capturing screen views, sign-in/up, subscription created/toggled events.
- **No backend** — this is the current top blocker for everything else.

---

## 1. Backend & Data Persistence (Foundational — do this first)

### 1.1 Choose & set up backend
- [ ] Provision **Supabase** project (Postgres + Auth bridge + RLS). Chosen over Neon because it ships a React Native client SDK and RLS out of the box — no separate API server needed.
- [ ] Configure **Clerk ↔ Supabase JWT bridge** (Clerk issues JWT with `sub` claim → Supabase validates via JWT template → RLS policies scope every table by `auth.jwt() ->> 'sub'`).
- [ ] Store Supabase URL/anon key in `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`), never the service role key client-side.
- [ ] Add `@supabase/supabase-js` + AsyncStorage-based session persistence adapter for RN.

### 1.2 Schema design
- [ ] `subscriptions` table:
  - `id uuid pk`, `user_id text` (Clerk sub), `name text`, `icon_key text`, `custom_icon_url text nullable`, `price numeric(10,2)`, `currency text default 'USD'`, `billing_cycle text` (`monthly`/`yearly`/`weekly`/`custom`), `category text`, `payment_method_id uuid fk nullable`, `status text` (`active`/`paused`/`cancelled`), `start_date timestamptz`, `renewal_date timestamptz`, `notes text nullable`, `created_at`, `updated_at`.
- [ ] `payment_methods` table:
  - `id uuid pk`, `user_id text`, `label text` (e.g. "Visa •• 8530"), `brand text`, `last4 text`, `is_default boolean`, `created_at`.
- [ ] `subscription_events` table (for history/insights/audit trail):
  - `id uuid pk`, `subscription_id uuid fk`, `type text` (`created`/`renewed`/`price_changed`/`cancelled`/`paused`/`resumed`), `previous_value jsonb nullable`, `new_value jsonb nullable`, `occurred_at timestamptz`.
- [ ] `user_settings` table:
  - `user_id text pk`, `currency text default 'USD'`, `notifications_enabled boolean`, `reminder_days_before int default 3`, `theme text default 'system'`, `created_at`, `updated_at`.
- [ ] RLS policies on every table: `user_id = auth.jwt() ->> 'sub'` for select/insert/update/delete.
- [ ] Add DB indexes: `subscriptions(user_id, status)`, `subscriptions(user_id, renewal_date)`.

### 1.3 Client data layer
- [ ] Replace zustand's static seed with real fetch on mount (`useEffect` + Supabase query), keep zustand as the client-side cache/store shape.
- [ ] Add optimistic updates for create/update/delete (update store immediately, roll back on error).
- [ ] Add `isLoading` / `error` state to the store for UI states.
- [ ] Add a lightweight query layer (React Query or SWR) *or* keep it hand-rolled in zustand — decide based on how much caching/retry logic is wanted. React Query recommended for free retry/cache invalidation.
- [ ] Migration script / seed script to push current dummy `HOME_SUBSCRIPTIONS` into Supabase for local dev/demo purposes (optional, useful for screenshots).

### 1.4 Cleanup
- [ ] Delete orphaned `context/subscriptions.tsx`.
- [ ] Remove `constants/data.ts` dummy `HOME_SUBSCRIPTIONS`/`UPCOMING_SUBSCRIPTIONS`/`HOME_BALANCE` once real data flows in (or keep behind a `__DEV__` demo-seed flag).

---

## 2. Subscription Lifecycle Features

### 2.1 Subscription Detail Page (`app/subscriptions/[id].tsx`)
- [ ] Wire up navigation: tapping a `SubscriptionCard` (both Home and Subscriptions screens) routes to `/subscriptions/[id]` instead of (or in addition to) inline expand. Decide: keep inline expand for quick glance, add a "View details" affordance for the full page — or replace expand entirely with navigation. **Decision needed.**
- [ ] Full detail view: icon, name, plan, price, billing cycle, category, payment method, status badge, start date, renewal date, notes.
- [ ] **Renewal countdown**: "Renews in X days" computed live from `renewalDate` vs `dayjs()`. Color-code: green (>7 days), amber (≤7 days), red (overdue/today).
- [ ] **Edit** — reuse `CreateSubscriptionModal` in an edit mode (pre-filled fields, PATCH instead of POST).
- [ ] **Cancel** — sets `status = 'cancelled'`, keeps history, asks for confirmation, optional "reason for cancelling" for future insights.
- [ ] **Pause/Resume** — sets `status = 'paused'` / back to `'active'`, excluded from balance/insights totals while paused.
- [ ] **Delete** — hard delete with confirmation dialog (different from cancel — removes entirely from history).
- [ ] **Renewal history** — list of past `subscription_events` (price changes, renewals) if any exist.
- [ ] Share/export single subscription info (optional, low priority).

### 2.2 Renewal date lifecycle (auto-advance)
- [ ] When a `renewalDate` passes and status is still `active`, roll it forward by one billing cycle (server-side function, Supabase Edge Function on a cron, OR computed client-side lazily on read — recommend a Postgres function + `pg_cron` scheduled daily for correctness across devices).
- [ ] Log a `subscription_events` row of type `renewed` each time this happens (feeds insights/history).
- [ ] Edge case: leap years / months with fewer days (e.g. renew Jan 31 monthly → Feb 28/29) — use `dayjs().add(1, 'month')` semantics carefully, decide policy (clamp vs roll to next valid date).

### 2.3 Payment Methods
- [ ] New screen: `app/payment-methods/index.tsx` (or nested under Settings) — list, add, edit, delete, set-default.
- [ ] Add-card form: label, brand (dropdown: Visa/Mastercard/Amex/Other), last 4 digits (numeric, exactly 4 chars, no real full card numbers ever — this is a memory aid only, not a payments product).
- [ ] Picker component in `CreateSubscriptionModal` (and edit mode) to attach a `payment_method_id` instead of a free-text string.
- [ ] Empty state: "No payment methods yet — add one to track what you're paying with."
- [ ] Edge case: deleting a payment method that's attached to active subscriptions — either block deletion or set `payment_method_id = null` on those subscriptions with a warning.

### 2.4 Custom subscription icons
- [ ] Icon picker in the create/edit modal: choose from existing bundled brand icons (`constants/icons.ts`) via a searchable grid, or fall back to an auto-generated colored initials avatar (e.g. first letter of name on `CATEGORY_COLORS` background) when no matching icon exists.
- [ ] Currently every custom subscription defaults to `icons.plus` — replace with the initials-avatar fallback.

---

## 3. Home Screen Upgrades

- [ ] Compute **Balance card** from real data: sum of active subscriptions normalized to monthly cost (yearly ÷ 12, weekly × ~4.33), instead of static `HOME_BALANCE`.
- [ ] "Next renewal date" on balance card = soonest upcoming renewal among active subscriptions.
- [ ] **Upcoming carousel** derived from real subscriptions: filter `status === 'active'`, sort by `renewalDate` ascending, take next N, compute `daysLeft` live.
- [ ] Pull-to-refresh (`RefreshControl` on the `FlatList`).
- [ ] Skeleton/loading state while initial data fetches.
- [ ] Empty state copy improvements (first-time user with zero subscriptions — encourage adding one).
- [ ] Optional: greeting message based on time of day ("Good morning, Martin").

---

## 4. Subscriptions List Upgrades

- [ ] Sort options: by name, price (asc/desc), renewal date (soonest first), date added.
- [ ] Filter chips: by status (active/paused/cancelled), by category, by billing cycle.
- [ ] Swipe actions on `SubscriptionCard` (swipe to pause/cancel/delete) — optional polish, uses `react-native-gesture-handler` (already a dependency).
- [ ] Debounce search input if list grows large (not urgent at current scale).
- [ ] Group by category (optional section-list view toggle).

---

## 5. Insights Tab (currently empty — build from scratch)

- [ ] **Total spend summary**: this month, this year, projected annual spend.
- [ ] **Spend by category** — pie or bar chart (need a chart lib: `react-native-gifted-charts`, `victory-native`, or `react-native-svg`-based custom charts since `react-native-svg` is already a dependency).
- [ ] **Spend trend over time** — line chart of monthly totals (requires `subscription_events` history or monthly snapshots).
- [ ] **Most expensive subscriptions** — top 5 list, sorted by price.
- [ ] **Upcoming renewals** — next 7/30 days list, reused from Home's upcoming logic but fuller (all matches, not just top 3).
- [ ] **Active vs paused vs cancelled** counts/breakdown.
- [ ] **Savings insight** (optional/stretch): flag subscriptions unused/rarely opened (would require usage tracking — likely out of scope for v1).
- [ ] Currency-aware totals if multi-currency subscriptions exist (convert to a base currency for aggregate totals — needs an FX rate source, e.g. a free exchange-rate API, cached daily).

---

## 6. Settings Upgrades

- [ ] **Currency preference** — base currency for aggregate totals (Home balance, Insights), stored in `user_settings`.
- [ ] **Notification preferences** — toggle renewal reminders, configure "remind me X days before renewal" (default 3).
- [ ] **Theme** — light/dark/system toggle if not already automatic via `userInterfaceStyle` in `app.json` (currently set to `"automatic"` — confirm in-app override isn't needed, or add explicit toggle for user control).
- [ ] **Payment methods** — link/entry point to the payment methods screen (Section 2.3).
- [ ] **Manage categories** — allow renaming/adding custom categories beyond the fixed `CATEGORIES` list in `CreateSubscriptionModal.tsx`.
- [ ] **Data export** — export subscriptions as CSV/JSON (nice portfolio touch, shows real-world usefulness).
- [ ] **Delete account** — required for App Store/Play Store compliance if accounts + personal data exist. Must cascade-delete Supabase rows and Clerk user.
- [ ] **About/version** — app version, build number, links to privacy policy & terms.
- [ ] **Privacy Policy / Terms of Service** — required before submitting to Apple/Google. Can be a simple static page or hosted markdown.

---

## 7. Notifications

- [ ] Integrate `expo-notifications` for local push reminders ("Netflix renews tomorrow — $15.99").
- [ ] Schedule a local notification per subscription based on `renewal_date - reminder_days_before` from `user_settings`.
- [ ] Re-schedule notifications whenever a subscription is created/edited/renewed/cancelled (cancel the old scheduled notification, create a new one).
- [ ] Request notification permissions with a clear rationale screen (ties into Onboarding, Section 8).
- [ ] Handle permission denial gracefully — app should work fully without notifications, just show an in-app banner suggesting enabling them.
- [ ] Edge case: app not opened for a long time — local notifications still fire since they're scheduled OS-side, but if subscription data changes server-side while app is closed, scheduled notifications could go stale. Consider a lightweight background fetch/refresh on app foreground to re-sync and re-schedule.

---

## 8. Onboarding (currently a stub)

- [ ] Welcome screen(s): 2–3 short slides explaining the app's value (track subscriptions, get reminders, see spend insights).
- [ ] Notification permission ask, framed with context (from Section 7).
- [ ] Optional: quick "add your first subscription" prompt at the end of onboarding to reduce empty-state friction.
- [ ] Route logic: show onboarding once per install (store a flag in `SecureStore`/`AsyncStorage`, or check `user.publicMetadata` if tied to account).

---

## 9. Cross-Cutting Edge Cases & Correctness

### Data & validation
- [ ] Price validation already strict (`Number()` rejects `"12abc"`/`"1.2.3"`) — extend to reject negative, extend to cap unreasonable values (e.g. > $100,000) with a sanity warning.
- [ ] Currency mismatch: if a user has subscriptions in multiple currencies, aggregate totals (Home balance, Insights) need explicit conversion or clear per-currency grouping — don't silently sum mixed currencies.
- [ ] Renewal date in the past at creation time — decide behavior (auto-correct to next valid cycle, or allow and mark "overdue").
- [ ] Duplicate subscription detection (same name + similar price) — soft warning, not a hard block, in case of legitimate duplicates (e.g. two Netflix profiles).
- [ ] Timezone handling — all dates stored as UTC (`toISOString()` already does this), but "renews in X days" display math should use the user's local calendar day, not raw hour diff (avoid "renews in 0 days" vs "renews today" ambiguity from time-of-day offsets).
- [ ] Decimal precision — ensure price storage/display never drifts due to floating point (Postgres `numeric` type handles this server-side; client should format via `toFixed(2)` consistently, already done in `formatCurrency`).

### UI/UX resilience
- [ ] Loading states for every async screen (Home, Subscriptions, Insights, Detail, Payment Methods) — currently only Home/Subscriptions have `ListEmptyComponent`, no true loading skeletons.
- [ ] Error states — network failure, Supabase error, Clerk auth error — show retry UI, not a blank screen or crash.
- [ ] Offline handling — queue writes or block with a clear "you're offline" banner (`@react-native-community/netinfo` would need to be added as a dependency).
- [ ] Empty states audited for every list (Home upcoming, Home subscriptions, Subscriptions search results, Insights when zero data, Payment methods, Notifications history).
- [ ] Accessibility sweep: continue the `accessibilityRole`/`accessibilityLabel` pattern already started on Pressables — extend to all interactive elements (category chips, frequency toggle, sort/filter chips, swipe actions).
- [ ] Keyboard handling audited for every form, not just the create modal (payment method form, settings inputs).
- [ ] Dark mode visual QA once theme toggle exists — verify all `global.css` color tokens have sensible dark variants (check `colors` in `constants/theme.ts` for dark-mode equivalents).

### Auth & security
- [ ] Verify Clerk session refresh handles token expiry gracefully mid-session (no abrupt logout on a stale token during a request).
- [ ] Supabase RLS tested explicitly — attempt cross-user data access in a test to confirm policies actually block it, not just "trust the policy exists."
- [ ] No sensitive data (full card numbers, etc.) ever collected — reinforce this is a personal tracker, not a payments product, in copy/UI (e.g. field labeled "Last 4 digits" not "Card number").

### Performance
- [ ] `FlatList` virtualization is fine at current scale; if subscription counts grow large in testing, verify `keyExtractor`/`getItemLayout` are optimal.
- [ ] Memoize expensive derived values (Home balance calc, Insights aggregations) with `useMemo`, especially once real data + charts are involved.

---

## 10. Publishing Prep

- [ ] Finalize app icon, splash screen, adaptive icon assets (`app.json` already references `assets/images/icon.png`, `splash-pattern.png`, `android-icon-*` — confirm these exist and look final, not placeholders).
- [ ] Privacy Policy + Terms hosted somewhere (GitHub Pages, Notion public page, or a simple static route in-app) — required for both stores.
- [ ] App Store Connect / Google Play Console listing: screenshots (light + dark if supported), description, keywords, category (Finance or Productivity), age rating.
- [ ] Verify `eas.json` build profiles (development/preview/production) are correct; run a preview build before final submission.
- [ ] `bundleIdentifier`/`package` in `app.json` (`com.elmars.subly`) — confirm this is the final, intended identifier before first submission (can't easily change post-launch).
- [ ] Remove/guard any debug logging, dev-only PostHog events, and Clerk "development keys" warning (currently shown in Metro logs) before production build — set up production Clerk instance keys via EAS secrets/env.
- [ ] TestFlight / Play Internal Testing round with a few real users before public release.

---

## Suggested Build Order (Phase Plan)

1. **Phase 1 — Backend Foundation**: Section 1 (Supabase + schema + client data layer + cleanup).
2. **Phase 2 — Core Lifecycle**: Section 2 (Detail page, renewal auto-advance, payment methods, icon picker).
3. **Phase 3 — Home & List Polish**: Sections 3 & 4 (real derived data, sort/filter).
4. **Phase 4 — Insights**: Section 5.
5. **Phase 5 — Settings & Notifications**: Sections 6 & 7.
6. **Phase 6 — Onboarding**: Section 8.
7. **Phase 7 — Edge Cases & Resilience Pass**: Section 9 (do this iteratively throughout too, not just at the end).
8. **Phase 8 — Publish Prep**: Section 10.

---

## Notes for Next Session

- You're currently working on the backend — when you're back, start at **Section 1.1/1.2** (Supabase schema + Clerk JWT bridge) if not already done, then move to **1.3** (client data layer wiring into `store/subscriptions.ts`).
- Decide the Section 2.1 navigation question (inline expand vs. detail page vs. both) before building the detail screen — affects `SubscriptionCard` API (`onPress` currently only toggles expand).
- Pick a charts library for Section 5 before starting Insights (recommend checking `react-native-gifted-charts` first — lighter weight, good RN/Expo support).
