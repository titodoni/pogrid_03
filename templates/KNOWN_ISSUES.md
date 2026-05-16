# KNOWN_ISSUES

## Current Phase Issues

```txt
1. Session cookie management implemented — login/logout flow works.
2. Proxy (middleware) uses cookie existence check only; full session validation happens in layout/API.
3. Superadmin login at /superadmin requires workspace-scoped user — seed creates superadmin without workspaceId.
4. Login page fetches /api/users which returns ALL workspace users; no multi-tenant isolation check yet.
5. Profile PIN change uses PinPad component — still shows dots correctly when changing PIN.
6. Notification bell still shows hardcoded 0 unread.
7. Notification drawer/sheet not built yet.
8. RoleActionPanel still a visual placeholder — no real mutation connections.
9. BottomNav does not update reactively when role changes mid-session.
10. No mobile-safe-area padding for phone notches.
11. No desktop layout adaptation — only mobile-first.
12. Superadmin login flow needs workspace lookup — currently hits /api/auth/login which expects userId.
```

## Phase 4 Issues

```txt
1. Superadmin login at /superadmin needs special handling — superadmin has no workspaceId.
   Current /api/auth/login requires userId; superadmin page doesn't know the userId.
   Fix needed: superadmin login should look up superadmin user or bypass workspace requirement.
2. PIN cooldown implemented client-side (2s) but not server-side (no rate limiting).
3. Forgot PIN WhatsApp number hardcoded to seed value — should come from workspace config.
4. Superadmin route /superadmin is accessible without auth (proxy.ts allows it through).
   The page itself does client-side validation but server-side guard is needed for API access.
5. No middleware for role-based route redirects — proxy.ts only checks for cookie existence.
6. Authenticated layout shows loading state while checking session — no flash of wrong content.
7. usePusherChannel dynamically imports pusher-js — no type definitions, ref-based approach avoids lint issues.
8. No Sentry integration for mutation error monitoring.
```

## Pre-existing Issues

```txt
1. No test infrastructure set up.
2. No Sentry integration.
3. No server-side rate limiting or PIN cooldown.
4. Pusher env vars not set for production — Pusher will not work until configured.
```

## Resolved Issues

```txt
1. Fixed middleware.ts → proxy.ts migration for Next.js 16.
2. Fixed useSearchParams() Suspense boundary in login page.
3. Fixed PinPad component lint errors (Date.now during render, setState in useEffect).
4. Fixed unused variables and any-type lint errors across API routes.
5. Fixed Prisma client generation and type imports.
6. Fixed seed.ts to use bcryptjs hashPin() for consistent PIN hashing.
7. Fixed (authenticated)/layout.tsx to use real session data instead of hardcoded ADMIN.
8. Previous issue 2 (Auth/session system) resolved — login/logout/profile/PIN change implemented.
9. Previous issue 5 (unused setState variables in profile) resolved.
10. Previous issue 12 (Settings/flags typo) already fixed.
```
