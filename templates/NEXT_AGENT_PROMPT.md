# NEXT_AGENT_PROMPT

## Phase 4 — Workflow Implementation

Phase 3 is complete. The mutation, audit, notification, Pusher, and optimistic-update foundation is built.

### What Exists Now

- AppShell with TopBar (title + notification bell) and BottomNav (role-aware)
- All route placeholders at: /login, /dashboard, /pos, /pos/new, /pos/[id], /po, /tasks, /board, /problems, /finance, /settings, /settings/users, /settings/clients, /settings/flags, /profile, /superadmin, /demo
- Shared item display components: ItemTaskCard, ItemDetailDrawer, ProgressSnapshot, DepartmentProgressRow, UrgencyBorder, ProblemBadge, LineagePill, RoleActionPanel (placeholder), ConfirmSheet, EmptyState, LoadingState, ErrorState
- lib/constants.ts — role home routes and bottom nav items
- lib/utils.ts — cn() and getPageTitle()

### Phase 3 Infrastructure (New)

- **Mutation pipeline**: `executeMutation()` server wrapper with session validation, role guard, audit log, notification, and Pusher broadcast
- **Error system**: `MutationError` hierarchy with Bahasa error messages via `ERROR_MESSAGES`
- **Session/Guard**: `validateSession()`, `requireSession()`, `checkRole()`, `assertRole()`
- **Audit**: `createAuditLog()` — append-only permanent history
- **Notifications**: `createNotification()`, `createNotifications()` — persistent DB records
- **Pusher server**: `broadcastEvent()` — typed event system with `PUSHER_EVENTS` and `PUSHER_CHANNELS`
- **Pusher client**: `usePusherChannel()` — auto-subscribes and invalidates queries on events
- **TanStack Query**: `QueryProvider` integrated into root layout, standard `queryKeys` for all entities
- **Invalidation map**: Full invalidation logic for every event type in `invalidation-map.ts`
- **Optimistic mutation**: `useOptimisticMutation()` — 5-second undo Sonner toast, delayed commit, cancel, error/retry

### What Phase 4 Should Do

Phase 4 should implement the full business workflow:

1. **Auth system** — Implement session creation (login), cookie management, logout
2. **Middleware** — Route protection with role-based redirects
3. **(authenticated) layout** — Real role detection from session
4. **Admin PO flow** — Create PO, list POS, PO detail, delete PO
5. **Operator task flow** — Task list with real data, progress update, 5-second undo
6. **Drafter flow** — Approve drawing, request redraw
7. **Purchasing flow** — Milestone checkboxes
8. **QC flow** — Pass/minor/major decision gate
9. **Delivery flow** — Confirm delivery, trigger return
10. **Finance flow** — Mark invoiced, paid, reverse
11. **Problem reporting** — Report and resolve problems
12. **Dashboard** — KPI cards and charts
13. **Notification system** — Real notification drawer with unread count
14. **Board** — Global floor view with stage columns

### Key Technical Decisions Already Made

- Client components import Prisma types from `@/app/generated/prisma/browser` (NOT client.ts)
- Server code imports from `@/app/generated/prisma/client`
- lib/db/prisma.ts — server-side PrismaClient singleton using PrismaPg adapter
- All UI text is Bahasa Indonesia
- Mobile-first layout, touch targets ≥44px
- No monetary fields, no upload UI, no external client portal
- ItemTaskCard and ItemDetailDrawer must not own business truth
- Mutations go through `executeMutation()` wrapper
- Pusher broadcasts only after DB commit
- AuditLog stores permanent history
- Notifications are persistent DB records
- useOptimisticMutation: 5-second undo before server commit, no DB write/AuditLog/Pusher on cancel
- TanStack Query invalidates on Pusher events, does not store business truth

### Known Constraints for Phase 4

- npm only (not pnpm)
- No PRD logic changes
- No money fields, no uploads, no external client portal
- No per-user item assignment
- DONE is terminal
- Progress cannot decrease
- QC/Delivery/Finance must follow the PRD permission matrix
- Pusher payloads must be IDs/metadata only (no full business objects)
- PostgreSQL is source of truth; Pusher is event broadcast only; Sonner is local toast only

### Build Verification

Before completing, run:
```bash
npm run lint
npx tsc --noEmit
npm run build
```
