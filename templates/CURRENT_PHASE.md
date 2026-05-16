# CURRENT_PHASE

## Current Phase

```txt
Phase: 03A_MUTATION_AUDIT_NOTIFICATION_PUSHER_INFRA + 03B_UNDO_OPTIMISTIC_MUTATION_ENGINE
Status: done
Started At: 2026-05-16 14:30:00 +07
Last Updated: 2026-05-16 15:45:00 +07
```

## Phase Goal

```txt
Build shared mutation, audit, notification, realtime, and optimistic-update foundation needed by all workflow actions.
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
- no QC/Delivery/Finance business logic yet
- PostgreSQL is source of truth
- Prisma writes data
- AuditLog stores permanent history
- Notification stores persistent in-app notifications
- Pusher broadcasts change events only (IDs/metadata, not full objects)
- TanStack Query invalidates/refetches on Pusher events
```

## Blockers

```txt
None.
```

## Phase 3 Results

```txt
Phase 3A completed:
- lib/db/prisma.ts — Prisma Client singleton (server-side)
- lib/workflow/mutation-result.ts — Standard MutationResult<T> type with successResult/failureResult helpers
- lib/workflow/mutation-wrapper.ts — executeMutation() server wrapper with session validation, role guard, audit log, notification, and Pusher broadcast
- lib/workflow/errors.ts — MutationError hierarchy (AuthError, PermissionError, ValidationError, NotFoundError, ConflictError, ProgressDecreaseError) with Bahasa error messages
- lib/auth/session.ts — validateSession() and requireSession() server-side helpers reading httpOnly cookie
- lib/auth/role-guard.ts — checkRole() and assertRole() server-side role/permission guard
- lib/audit/audit-log.ts — createAuditLog() helper with known action map
- lib/notifications/notification.ts — createNotification() and createNotifications() helpers
- lib/realtime/events.ts — PUSHER_EVENTS enum, typed payload interfaces, PUSHER_CHANNELS channel builders
- lib/realtime/pusher-server.ts — broadcastEvent() server-side Pusher helper with channel routing
- lib/realtime/index.ts, lib/audit/index.ts, lib/notifications/index.ts, lib/auth/index.ts, lib/workflow/index.ts, lib/queries/index.ts — barrel exports

Phase 3B completed:
- Installed @tanstack/react-query, pusher (server), pusher-js (client)
- components/providers/query-provider.tsx — QueryClientProvider wrapper with standard defaults
- app/providers.tsx — Client-side Providers wrapper (QueryProvider)
- app/layout.tsx — Updated to include Providers
- lib/queries/keys.ts — All standard query keys (session, currentUser, tasks, item, po, poList, board, notifications, finance, dashboard, problems, auditLog, etc.)
- lib/queries/invalidation-map.ts — Invalidation handlers for every Pusher event type
- components/hooks/use-pusher.ts — usePusherChannel() client hook subscribing to workspace/po/item/user/role channels, auto-invalidating queries on events
- lib/workflow/use-optimistic-mutation.ts — useOptimisticMutation() hook with 5-second undo toast, delayed commit, cancel, error state, and retry

Tooling installed:
- npm packages: @tanstack/react-query, pusher, pusher-js

Lint: No errors, no warnings.
TypeScript: Compiles cleanly.
Build: Compiled successfully (first build), all 20 routes generated.
```

## Verified

```txt
npm run lint — passes (no errors)
npx tsc --noEmit — passes (no errors)
npm run build — compiled successfully (20 routes)
```

## Files Created in Phase 3

```
lib/db/prisma.ts
lib/auth/session.ts
lib/auth/role-guard.ts
lib/auth/index.ts
lib/workflow/mutation-result.ts
lib/workflow/mutation-wrapper.ts
lib/workflow/errors.ts
lib/audit/audit-log.ts
lib/audit/index.ts
lib/notifications/notification.ts
lib/notifications/index.ts
lib/realtime/events.ts
lib/realtime/pusher-server.ts
lib/realtime/index.ts
lib/queries/keys.ts
lib/queries/invalidation-map.ts
lib/queries/index.ts
lib/workflow/use-optimistic-mutation.ts
lib/workflow/index.ts
components/providers/query-provider.tsx
components/providers/index.ts
components/hooks/use-pusher.ts
components/hooks/index.ts
app/providers.tsx
```
