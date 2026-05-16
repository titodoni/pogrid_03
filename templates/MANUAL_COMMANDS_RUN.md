# MANUAL_COMMANDS_RUN

## Phase 4 Commands

### Install Packages (if needed)
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```
(bcryptjs was already in package.json from Phase 2 — no install needed)

### Prisma Client Generation
```bash
npx prisma generate
```

### Database Seed (if reset needed)
```bash
npx prisma db seed
```

### Lint Check
```bash
npm run lint
```
Result: No errors, no warnings.

### TypeScript Check
```bash
npx tsc --noEmit
```
Result: No errors.

### Production Build
```bash
npm run build
```
Result: Compiled successfully. All 26 routes generated.

## Phase 4A — Server-Side Authorization and Role Guards

### Files created:
- lib/auth/guards.ts — 14 permission guards (requireRole, requireAdmin, requireSuperadmin,
  requireFinance, requireQC, requireDelivery, requireOperatorDepartment, assertCanViewItem,
  assertCanMutateItemStage, assertCanManageUsers, assertCanManageClients, assertCanViewAnalytics,
  assertCanResolveProblem)

### Guard design:
- All guards use typed return { allowed: true } | { allowed: false; reason: string }
- assert* variants throw PermissionError from workflow/errors
- Superadmin bypasses all guards
- Admin passes all guards (override pattern)
- requireOperatorDepartment optionally takes targetRoleKey for department-scoped checks
- assertCanMutateItemStage uses stage-role mapping (DRAFTING→DRAFTER, PRODUCTION→OPERATOR, etc.)
- assertCanResolveProblem allows reporter, same-stage operator, admin, manager

## Phase 4B — Auth, PIN, Profile, and Superadmin Login

### Files created:
- lib/auth/pin.ts — hashPin(), verifyPin() with bcryptjs, generateStaffPin()
- proxy.ts — Next.js 16 proxy route protection (replaces middleware.ts)
- components/pin-pad.tsx — Reusable numeric PIN pad component
- app/api/auth/login/route.ts — PIN verification + session creation
- app/api/auth/logout/route.ts — Session destruction
- app/api/auth/change-pin/route.ts — Self-serve PIN change
- app/api/auth/reset-pin/route.ts — Admin PIN reset
- app/api/auth/session/route.ts — Session check
- app/api/users/route.ts — Active users listing

### Files modified:
- lib/auth/session.ts — Added createSession, destroySession, setSessionCookie, clearSessionCookie
- lib/auth/index.ts — Reorganized exports
- app/login/page.tsx — Full 3-step login flow
- app/superadmin/page.tsx — 6-digit PIN login
- app/(authenticated)/layout.tsx — Real session check
- app/(authenticated)/profile/page.tsx — Profile with PIN change + logout
- prisma/seed.ts — Uses bcryptjs hashPin
- app/globals.css — Added animate-shake keyframe

### Login flow:
1. User opens /login
2. Fetches /api/users → groups by roleKey (excludes SUPERADMIN)
3. Displays role/department icons with active user counts
4. User taps role → user list appears
5. User taps name → 4-digit PIN pad appears
6. Correct PIN → session created → redirect to role home route
7. Wrong PIN → shake animation + error + cooldown

### Superadmin flow:
1. User navigates to /superadmin (hidden, bookmark-only)
2. 6-digit PIN pad appears
3. Correct PIN → session created → stays on /superadmin
4. Wrong PIN → shake animation + error + cooldown

### Profile flow:
1. User navigates to /profile
2. Sees name and role
3. Can change PIN via PinPad
4. Can logout explicitly

---

## Required Environment Variables

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

---

## Previous Phase Commands (Historical)

### Phase 3 Commands
```bash
npm install @tanstack/react-query pusher pusher-js
```

### Phase 2 Commands
```bash
npx shadcn@latest add card badge drawer sheet tabs avatar separator sonner skeleton
npx shadcn@latest add dropdown-menu dialog alert-dialog
npm install @radix-ui/react-progress
npm install zod react-hook-form @hookform/resolvers bcryptjs date-fns sonner
npm install -D @types/bcryptjs prettier
```
