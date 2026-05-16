# CURRENT_PHASE

## Current Phase

```txt
Phase: 04A_SERVER_AUTHORIZATION_ROLE_GUARDS + 04B_AUTH_PIN_PROFILE_SUPERADMIN
Status: done
Started At: 2026-05-16 17:00:00 +07
Last Updated: 2026-05-16 19:30:00 +07
```

## Phase Goal

```txt
Build secure server-side authorization guards and complete the POgrid PIN authentication foundation.
```

## Active Constraints

```txt
- npm only
- mobile-first
- Bahasa Indonesia UI
- no PRD logic changes
- no money fields
- no uploads
- no external client portal
- no full business workflow yet
- no Drafting/Purchasing/QC/Delivery/Finance workflow logic yet
- PostgreSQL is source of truth
- Prisma writes data
- PINs hashed with bcryptjs (never plaintext)
- Sessions never expire; logout is explicit only
- Superadmin hidden from public login
- Staff PIN = 4 digits, Superadmin PIN = 6 digits
- Next.js 16 proxy convention (not middleware)
```

## Blockers

```txt
None.
```

## Phase 4 Results

```txt
Phase 4A completed:
- lib/auth/guards.ts — 14 permission guards (requireSession, requireRole, requireAdmin,
  requireSuperadmin, requireFinance, requireQC, requireDelivery, requireOperatorDepartment,
  assertCanViewItem, assertCanMutateItemStage, assertCanManageUsers, assertCanManageClients,
  assertCanViewAnalytics, assertCanResolveProblem)
- Guards use typed AuthError/PermissionError from workflow/errors
- Unauthorized = no valid session; Forbidden = valid session but insufficient role
- Superadmin bypasses all role checks
- Admin override pattern established (Admin passes all guards)

Phase 4B completed:
- lib/auth/pin.ts — hashPin(), verifyPin() using bcryptjs, generateStaffPin() for memorable 4-digit PINs
- lib/auth/session.ts — createSession(), destroySession(), setSessionCookie(), clearSessionCookie(),
  generateSessionToken(), validateSession(), requireSession() with AuthError
- proxy.ts — Route protection via Next.js 16 proxy convention; redirects unauthenticated requests to /login
- app/api/auth/login/route.ts — PIN verification and session creation
- app/api/auth/logout/route.ts — Session destruction and cookie clearing
- app/api/auth/change-pin/route.ts — Self PIN change with digit validation (4/6 digits) + audit log
- app/api/auth/reset-pin/route.ts — Admin PIN reset with generateStaffPin() + audit log
- app/api/auth/session/route.ts — Session check for client-side validation
- app/api/users/route.ts — List active users by roleKey/departmentId (excludes SUPERADMIN)
- components/pin-pad.tsx — Reusable numeric PIN pad with shake animation, cooldown, backspace
- app/login/page.tsx — Full 3-step login flow: role icons → user list → PIN pad, Lupa PIN WhatsApp link
- app/superadmin/page.tsx — Hidden /superadmin route with 6-digit PIN login
- app/(authenticated)/profile/page.tsx — Profile with name display, PIN change, logout
- app/(authenticated)/layout.tsx — Real session check from /api/auth/session instead of hardcoded ADMIN
- prisma/seed.ts — Updated to use bcryptjs hashPin() from pin module
- app/globals.css — Added animate-shake keyframe for wrong PIN animation
```

## Verified

```txt
npm run lint — passes (no errors, no warnings)
npx tsc --noEmit — passes (no errors)
npm run build — compiled successfully (26 routes)
```

## Files Created in Phase 4

```
lib/auth/pin.ts
lib/auth/guards.ts
proxy.ts
components/pin-pad.tsx
app/api/auth/login/route.ts
app/api/auth/logout/route.ts
app/api/auth/change-pin/route.ts
app/api/auth/reset-pin/route.ts
app/api/auth/session/route.ts
app/api/users/route.ts
```

## Files Modified in Phase 4

```
lib/auth/session.ts
lib/auth/index.ts
app/login/page.tsx
app/superadmin/page.tsx
app/(authenticated)/layout.tsx
app/(authenticated)/profile/page.tsx
prisma/seed.ts
app/globals.css
app/api/auth/change-pin/route.ts
app/api/auth/reset-pin/route.ts
app/api/users/route.ts
```
