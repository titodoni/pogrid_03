# NEXT_AGENT_PROMPT

## Phase 5 — Workflow Implementation

Phase 4 is complete. The server-side authorization system and PIN authentication foundation are built.

### What Exists Now

- **Auth system**: Full login/logout with PIN (4-digit staff, 6-digit superadmin), httpOnly session cookie, bcryptjs hashing
- **Login page**: Role icon grid → user list → PIN pad flow with shake/cooldown on wrong PIN
- **Superadmin page**: Hidden /superadmin route with 6-digit PIN login
- **Profile page**: Name display, PIN self-change, explicit logout
- **Route protection**: proxy.ts (Next.js 16 proxy convention) redirects unauthenticated to /login
- **Session API**: POST /api/auth/login, POST /api/auth/logout, POST /api/auth/change-pin, POST /api/auth/reset-pin, GET /api/auth/session
- **Users API**: GET /api/users — active users filtered by roleKey/departmentId (excludes SUPERADMIN)
- **Permission guards (14 total)**: requireSession, requireRole, requireAdmin, requireSuperadmin, requireFinance, requireQC, requireDelivery, requireOperatorDepartment, assertCanViewItem, assertCanMutateItemStage, assertCanManageUsers, assertCanManageClients, assertCanViewAnalytics, assertCanResolveProblem
- **Authenticated layout**: Real session check from /api/auth/session (no more hardcoded ADMIN)
- **AppShell**: with TopBar (title + notification bell placeholder) and BottomNav (role-aware)
- **All route placeholders** at: /dashboard, /pos, /pos/new, /pos/[id], /po, /tasks, /board, /problems, /finance, /settings, /settings/users, /settings/clients, /settings/flags, /demo
- **Shared item components**: ItemTaskCard, ItemDetailDrawer, ProgressSnapshot, DepartmentProgressRow, UrgencyBorder, ProblemBadge, LineagePill, RoleActionPanel (placeholder), ConfirmSheet, EmptyState, LoadingState, ErrorState
- **lib/constants.ts**: ROLE_HOME_ROUTES and BOTTOM_NAV_ITEMS
- **lib/utils.ts**: cn() and getPageTitle()

### Phase 4 Infrastructure (New)

- **Authorization guards**: `requireRole()`, `requireAdmin()`, `requireSuperadmin()`, `requireFinance()`, `requireQC()`, `requireDelivery()`, `requireOperatorDepartment()`, `assertCanViewItem()`, `assertCanMutateItemStage()`, `assertCanManageUsers()`, `assertCanManageClients()`, `assertCanViewAnalytics()`, `assertCanResolveProblem()` — all in `lib/auth/guards.ts`
- **PIN utilities**: `hashPin()`, `verifyPin()` (bcryptjs), `generateStaffPin()` in `lib/auth/pin.ts`
- **Session management**: `createSession()`, `destroySession()`, `validateSession()`, `requireSession()` with `AuthError`, cookie helpers in `lib/auth/session.ts`
- **Proxy**: Next.js 16 proxy convention in `proxy.ts` — route protection redirecting to /login
- **API Routes**:
  - `POST /api/auth/login` — PIN verify → session create
  - `POST /api/auth/logout` — Session destroy
  - `POST /api/auth/change-pin` — Self PIN change with audit log
  - `POST /api/auth/reset-pin` — Admin PIN reset with audit log
  - `GET /api/auth/session` — Session check
  - `GET /api/users` — Active users listing
- **Login UI**: Full 3-step flow (role icons → user list → PIN pad) with Lupa PIN WhatsApp link
- **Superadmin UI**: Hidden 6-digit PIN login
- **Profile UI**: Name, role, PIN change, logout

### Phase 3 Infrastructure (Existing)

- **Mutation pipeline**: `executeMutation()` server wrapper with session validation, role guard, audit log, notification, and Pusher broadcast
- **Error system**: `MutationError` hierarchy with Bahasa error messages
- **Audit**: `createAuditLog()` — append-only permanent history
- **Notifications**: `createNotification()`, `createNotifications()` — persistent DB records
- **Pusher server**: `broadcastEvent()` — typed event system
- **Pusher client**: `usePusherChannel()` — auto-subscribes and invalidates queries
- **TanStack Query**: `QueryProvider`, standard `queryKeys`, invalidation map
- **Optimistic mutation**: `useOptimisticMutation()` — 5-second undo
- **Progress floor**: `applyProgressFloor()` — client-side UX protection

### What Phase 5 Should Do

Phase 5 should implement the full business workflow starting with the PO creation and task flows:

1. **Admin PO Creation flow** (`/pos/new`) — Form with client dropdown, items, validation
2. **PO List** (`/pos`) — Real PO list with KPIs
3. **PO Detail** (`/pos/[id]`) — PO header + item list + activity log
4. **Operator Task List** (`/tasks`) — Real data query, role-filtered, search, tabs
5. **Operator Progress Update** — Update own department progress
6. **Drafter flow** — Approve drawing / request redraw
7. **Purchasing flow** — Milestone checkboxes
8. **QC flow** — Pass/minor/major decision gate
9. **Delivery flow** — Confirm delivery, trigger return
10. **Finance flow** — Mark invoiced/paid/reverse
11. **Problem reporting** — Report and resolve problems
12. **Dashboard** — KPI cards and charts
13. **Notification system** — Real notification drawer with unread count
14. **Board** — Global floor view with stage columns
15. **Settings/users** — List users, reset PIN, toggle active
16. **Settings/clients** — Client management

### Key Technical Decisions

- Client components import Prisma types from `@/app/generated/prisma/browser`
- Server code imports from `@/app/generated/prisma/client`
- `lib/db/prisma.ts` — server-side PrismaClient singleton using PrismaPg adapter
- All UI text is Bahasa Indonesia
- Mobile-first layout, touch targets ≥44px
- No monetary fields, no upload UI, no external client portal
- Mutations go through `executeMutation()` wrapper with guards
- Guards import from `lib/auth/guards.ts`
- Session is httpOnly cookie, validated via `validateSession()` or `requireSession()`
- PINs hashed with bcryptjs via `hashPin()`/`verifyPin()`
- Next.js 16 uses `proxy.ts` (NOT `middleware.ts`) — export function is `proxy`
- `useSearchParams()` must be wrapped in Suspense boundary on any page that uses it

### Build Verification

Before completing, run:
```bash
npm run lint
npx tsc --noEmit
npm run build
```
