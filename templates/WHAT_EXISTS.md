# WHAT_EXISTS

## Implemented Routes

```txt
- / (root) — Redirects to /login
- /login — Login page placeholder
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
- /profile — Profile page placeholder
- /superadmin — Superadmin page placeholder
- /demo — Demo page placeholder

All authenticated routes wrapped in (authenticated) route group with AppShell layout.
```

## Implemented Infrastructure

### Database (lib/db/)
```txt
- lib/db/prisma.ts — Prisma Client singleton for server-side use (with PrismaPg adapter)
```

### Auth (lib/auth/)
```txt
- validateSession() — reads session_token cookie and validates against DB
- requireSession() — throws if no valid session
- checkRole() — verifies allowedRoles, department requirement, superadmin bypass
- assertRole() — throws if role check fails
- SessionPayload type — userId, role, roleKey, departmentId, workspaceId
```

### Workflow / Mutation (lib/workflow/)
```txt
- MutationResult<T> — standard { ok, data?, error?, auditId?, serverConfirmedAt? }
- successResult(), failureResult() — result factory functions
- executeMutation() — server wrapper: session → role guard → handler → audit → notification → pusher
- MutationError, AuthError, PermissionError, ValidationError, NotFoundError, ConflictError, ProgressDecreaseError
- ERROR_MESSAGES — centralized Bahasa Indonesia error messages
- useOptimisticMutation() — 5-second undo hook with Sonner toast, delayed commit, cancel, retry
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
- PUSHER_EVENTS — typed event name constants (PO_CREATED, PO_UPDATED, PO_DELETED, ITEM_PROGRESS_UPDATED, ITEM_STAGE_ADVANCED, ITEM_QC_PASSED, ITEM_QC_FAILED, ITEM_DELIVERED, ITEM_RETURN_SPAWNED, PROBLEM_REPORTED, PROBLEM_RESOLVED, INVOICE_STATUS_UPDATED, NOTIFICATION_CREATED)
- PUSHER_CHANNELS — channel builder functions (workspace, po, item, role, user)
- Typed payload interfaces for each event
- broadcastEvent() — server-side Pusher trigger with automatic channel routing
- usePusherChannel() — client-side subscription hook with auto-query invalidation on events
```

### Query / Cache (lib/queries/)
```txt
- queryKeys — all standard TanStack Query keys
- invalidateByEvent() — invalidation dispatcher by Pusher event type
- Full invalidation map for every event: PO_CREATED, PO_UPDATED, PO_DELETED, ITEM_PROGRESS_UPDATED, ITEM_STAGE_ADVANCED, ITEM_QC_PASSED, ITEM_QC_FAILED, ITEM_DELIVERED, ITEM_RETURN_SPAWNED, PROBLEM_REPORTED, PROBLEM_RESOLVED, INVOICE_STATUS_UPDATED, NOTIFICATION_CREATED
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
```

## Implemented Utilities

```txt
- lib/utils.ts — cn() classname utility, getPageTitle() route title resolver
- lib/constants.ts — ROLE_HOME_ROUTES, BOTTOM_NAV_ITEMS with Bahasa labels
- ERROR_MESSAGES — centralized Bahasa Indonesia error strings
```

## Installed Packages (Phase 3 additions)

```txt
- @tanstack/react-query — client-side cache/invalidation
- pusher — server-side realtime broadcasting
- pusher-js — client-side realtime subscription
```

## Important Notes

```txt
- Client components import from @/app/generated/prisma/browser
- Server code imports from @/app/generated/prisma/client
- lib/db/prisma.ts uses PrismaPg adapter from @prisma/adapter-pg
- Pusher env vars must be set: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER, NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER
- No business workflow mutations are implemented yet (no updateProductionProgress, no submitQCDecision, etc.)
- Phase 3 is complete: mutation foundation is ready for workflow implementation
```
