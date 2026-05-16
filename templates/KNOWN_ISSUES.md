# KNOWN_ISSUES

## Current Phase Issues

```txt
1. All route pages are placeholders with no data fetching or business logic.
2. Auth/session system not implemented — (authenticated) layout uses hardcoded ADMIN role.
3. Notification bell is a visual placeholder only (unread count hardcoded to 0).
4. Notification drawer/sheet has not been built yet.
5. RoleActionPanel is a visual placeholder — no real mutation connections.
6. ItemDetailDrawer tabs (Masalah) renders basic problem data but has no role-based action controls.
7. BottomNav does not have a role-aware session provider — role is passed as prop from layout.
8. Touch target minimum (44px) has not been verified across all components.
9. No mobile-safe-area padding for phone notches.
10. No desktop layout adaptation — only mobile-first.
11. Settings/flags page had a typo (text-muted-threshold) which was fixed.
```

## Phase 3 Issues

```txt
1. Session cookie management not implemented — no login/logout flow yet.
2. Pusher env vars not set — Pusher will not work until PUSHER_APP_ID, PUSHER_KEY, etc. are configured.
3. usePusherChannel dynamically imports pusher-js — no type definitions, ref-based approach avoids lint issues.
4. No Sentry integration for mutation error monitoring.
5. No rate limiting or PIN cooldown.
6. No middleware for route protection yet (requires session system to be implemented first).
7. executeMutation helper needs actual workflow handler implementations to be useful.
8. useOptimisticMutation hook is generic — production workflow implementations will need specific validation.
```

## Pre-existing Issues

```txt
1. No test infrastructure set up.
2. No Sentry integration.
3. No rate limiting or PIN cooldown.
4. Session management not implemented.
5. No middleware for route protection.
```

## Resolved Issues

```txt
1. Fixed seed.ts Prisma.InputJsonValue type error (fromValue/toValue/metadata types).
2. Fixed Prisma import path for client components — using browser.ts for browser-safe types.
3. Removed unused imports across all components.
4. Fixed use-pusher.ts ref access during render lint error.
5. Fixed use-optimistic-mutation.ts circular dependency lint error.
```
