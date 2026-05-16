# WHAT_EXISTS

## Implemented Routes

```txt
- / (root) — Redirects to /login
- /login — Full login flow: role icons → user list → PIN pad
- /dashboard — Dashboard placeholder
- /pos — PO list placeholder
- /pos/new — Create PO placeholder
- /pos/[id] — PO detail placeholder
- /po — Full PO list placeholder
- /tasks — Task list placeholder
- /board — Board placeholder
- /problems — Problems placeholder
- /finance — Finance placeholder
- /settings — Settings hub placeholder
- /settings/users — User management placeholder
- /settings/clients — Client management placeholder
- /settings/flags — Flag settings placeholder
- /profile — Profile page with name, PIN change, logout
- /superadmin — Superadmin PIN login
- /demo — Demo page placeholder

All authenticated routes wrapped in (authenticated) route group with AppShell layout.
Authenticated layout now checks real session via /api/auth/session.
```

## Implemented Infrastructure

### Database (lib/db/)
```txt
- lib/db/prisma.ts — Prisma Client singleton for server-side use (with PrismaPg adapter)
```

### Auth (lib/auth/)
```txt
- validateSession() — reads session_token cookie and validates against DB
- requireSession() — throws AuthError if no valid session
- createSession() — generates token, stores in DB, updates lastLoginAt
- destroySession() — deletes session by token from DB
- setSessionCookie() — sets httpOnly session_token cookie
- clearSessionCookie() — removes session_token cookie
- checkRole() — verifies allowedRoles, department requirement, superadmin bypass
- assertRole() — throws if role check fails
- SessionPayload type — userId, role, roleKey, departmentId, workspaceId, name

Permission guards (lib/auth/guards.ts):
- requireRole() — check if session has any of allowed roles
- requireAdmin(), requireSuperadmin(), requireFinance(), requireQC(), requireDelivery()
- requireOperatorDepartment() — operator for specific department
- assertCanViewItem() — all staff + superadmin
- assertCanMutateItemStage() — role-based stage mutation permission
- assertCanManageUsers(), assertCanManageClients() — admin only
- assertCanViewAnalytics() — admin/owner/manager/sales
- assertCanResolveProblem() — reporter/same-stage/admin/manager

PIN utilities (lib/auth/pin.ts):
- hashPin() — bcryptjs hash
- verifyPin() — bcryptjs compare
- generateStaffPin() — memorable 4-digit PIN
```

### Workflow / Mutation (lib/workflow/)
```txt
- MutationResult<T> — standard { ok, data?, error?, auditId?, serverConfirmedAt? }
- successResult(), failureResult() — result factory functions
- executeMutation() — server wrapper: session → role guard → handler → audit → notification → pusher
- MutationError, AuthError, PermissionError, ValidationError, NotFoundError, ConflictError, ProgressDecreaseError
- ERROR_MESSAGES — centralized Bahasa Indonesia error messages
- useOptimisticMutation() — 5-second undo hook with Sonner toast, delayed commit, cancel, retry, and optional validateInput guard
```

### Progress Floor (lib/progress/)
```txt
- applyProgressFloor() — standalone pure function: validates requested progress against server-confirmed floor
- Clamps above max, rejects below floor, returns typed ProgressFloorResult
- Client-side UX protection only; server-side mutation must still enforce no-decrease
```

### Audit Logs (lib/audit/)
```txt
- createAuditLog() — creates append-only AuditLog record
- Known AuditAction values: PROGRESS_UPDATE, STAGE_ADVANCE, ADMIN_OVERRIDE, QC_PASS, QC_MINOR_FAIL, QC_MAJOR_FAIL, REWORK_SPAWNED, RETURN_SPAWNED, INVOICE_UPDATE, EDIT_PO_FIELD, FLAG_ESCALATE, DELETE_PO, PROBLEM_REPORTED, PROBLEM_RESOLVED, PIN_RESET, SELF_PIN_CHANGE, USER_CREATED, USER_TOGGLED
```

### Notifications (lib/notifications/)
```txt
- createNotification() — creates single Notification record
- createNotifications() — bulk Notification creation
```

### Realtime / Pusher (lib/realtime/)
```txt
- PUSHER_EVENTS — typed event name constants
- PUSHER_CHANNELS — channel builder functions
- Typed payload interfaces for each event
- broadcastEvent() — server-side Pusher trigger with automatic channel routing
- usePusherChannel() — client-side subscription hook with auto-query invalidation
```

### Query / Cache (lib/queries/)
```txt
- queryKeys — all standard TanStack Query keys
- invalidateByEvent() — invalidation dispatcher by Pusher event type
```

### Proxy (proxy.ts)
```txt
- Route protection via Next.js 16 proxy convention
- Redirects unauthenticated requests to /login with redirect param
- Allows /login, /demo, /superadmin, /api, /_next, /favicon through without auth
```

### API Routes
```txt
- POST /api/auth/login — Verify PIN, create session, return redirect URL
- POST /api/auth/logout — Destroy session, clear cookie
- POST /api/auth/change-pin — Authenticated: verify digit length, hash new PIN, audit log
- POST /api/auth/reset-pin — Admin only: generate new PIN, hash, audit log, return new PIN
- GET /api/auth/session — Return current session data or null
- GET /api/users — List active users filtered by roleKey/departmentId (excludes SUPERADMIN)
```

### Providers (components/providers/, app/providers.tsx)
```txt
- QueryProvider — TanStack QueryClientProvider with 30s staleTime
- app/providers.tsx — client-side wrapper for all providers
- Integrated into root layout
```

## Implemented Components

### App Shell (components/app-shell/)
```txt
- AppShell — mobile-first layout wrapper with TopBar + BottomNav
- TopBar — page title and notification bell placeholder
- BottomNav — role-aware bottom navigation with Bahasa labels
- Index barrel export
```

### PIN Pad (components/)
```txt
- PinPad — reusable numeric keypad with shake animation, cooldown, backspace
- Configurable pinLength (4 or 6)
- Error display and shake animation on wrong PIN
```

### Shared Item Components (components/item/)
```txt
- ItemTaskCard — shared compact item card
- ItemDetailDrawer — shared item detail drawer/sheet with tabs
- ProgressSnapshot — read-only progress summary bar
- DepartmentProgressRow — single department row with status icon
- UrgencyBorder — left border urgency accent
- ProblemBadge — problem indicator count badge
- LineagePill — rework/return lineage badge
- RoleActionPanel — role-specific action placeholder
- ConfirmSheet — bottom sheet confirmation
- EmptyState, LoadingState, ErrorState
- Index barrel export
```

### Hooks (components/hooks/)
```txt
- usePusherChannel() — subscribes to Pusher channels, auto-invalidates TanStack Query
```

### UI Primitives (components/ui/)
```txt
- button, card, badge, drawer, sheet, tabs, avatar, separator, sonner, skeleton, dropdown-menu, dialog, alert-dialog, progress (shadcn/ui)
```

## Implemented Server Logic

```txt
- Prisma config with seed data (from Phase 01B)
- Full Prisma schema (Workspace, Department, User, Session, Client, ProductionOrder, Item, ItemProgress, Problem, Notification, AuditLog)
- Server mutation pipeline: session validation → role guard → mutation handler → audit log → notification → Pusher broadcast
- AuditLog helper
- Notification helper
- Pusher server helper
- Session creation/destruction with httpOnly cookie
- PIN hashing/verification with bcryptjs
- Authenticated session check endpoint
- Active users listing endpoint (excludes SUPERADMIN)
```

## Implemented Utilities

```txt
- lib/utils.ts — cn() classname utility, getPageTitle() route title resolver
- lib/constants.ts — ROLE_HOME_ROUTES, BOTTOM_NAV_ITEMS with Bahasa labels
- ERROR_MESSAGES — centralized Bahasa Indonesia error strings
```

## Key Notes

```txt
- Client components import Prisma types from @/app/generated/prisma/browser
- Server code imports from @/app/generated/prisma/client
- lib/db/prisma.ts uses PrismaPg adapter from @prisma/adapter-pg
- Pusher env vars must be set: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
- PINs hashed with bcryptjs (lib/auth/pin.ts)
- Session cookie is httpOnly, secure in production, sameSite lax
- Sessions never expire; logout is explicit
- Next.js 16 uses proxy.ts convention (not middleware.ts)
- Forgot PIN opens WhatsApp deep link to Admin number (not a notification channel)
- Superadmin route (/superadmin) is hidden from public login and not linked in UI
- Staff PIN = 4 digits, Superadmin PIN = 6 digits, validated server-side
- Wrong PIN triggers shake animation + brief cooldown before retry
- No business workflow mutations implemented yet
```
