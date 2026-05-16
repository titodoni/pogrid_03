# POgrid — Synced Tech Stack Specification

> Purpose: define the implementation stack that fits the synced POgrid PRD without changing product logic.
> Scope: architecture, libraries, infrastructure, security baseline, realtime/sync approach, and agent guardrails.
> Rule: this file explains technical choices only. It must not introduce new product features.

---

## 1. Product Fit Summary

POgrid is an internal production visibility system for fabrication factories. The stack must optimize for:

1. Mobile-first factory-floor use on cheap Android phones.
2. Tap-first workflows with minimal typing.
3. Fast perceived response for progress updates.
4. Reliable auditability for every confirmed operational mutation.
5. Realtime visibility across roles.
6. Single-tenant deployment per factory client.
7. Public-domain exposure with internal-app security hardening.
8. No ERP/accounting expansion, no monetary values, no attachments, no external client portal.

---

## 2. Final Recommended Stack

```txt
Runtime / Framework:     Next.js App Router
Language:                TypeScript
Package Manager:         npm only
UI Layer:                React + Tailwind CSS + shadcn/ui
Toast / Feedback:        Sonner
Icons:                   Lucide React
Forms:                   React Hook Form + Zod
Validation:              Zod shared between forms and server actions/API routes
Database ORM:            Prisma
Database — Local Dev:    PostgreSQL local
Database — Hosted:       Neon PostgreSQL
Deployment:              Vercel, one deployment per client
Realtime:                Pusher
Auth Model:              Custom PIN auth with httpOnly cookie session
PIN Hashing:             bcrypt or bcryptjs
Charts:                  Recharts
PDF Export:              Server-side PDF generation via Playwright or React PDF
Logging / Monitoring:    Sentry
Testing:                 Vitest + React Testing Library + Playwright
Lint / Format:           ESLint + Prettier
Date/Time:               date-fns or native Intl with Asia/Jakarta rules
```

---

## 3. Stack Decision Table

| Concern | Decision | Reason |
|---|---|---|
| App framework | Next.js App Router | Matches Vercel deployment, supports route handlers, server components, and role-gated pages. |
| Language | TypeScript | Required for safe workflow logic, role guards, quantity invariants, and audit metadata. |
| Database | PostgreSQL | Correct fit for relational production data: PO, item, department, progress, problems, audit logs, finance status. |
| ORM | Prisma | Clear schema, migrations, typed queries, good for AI-agent implementation. |
| Hosted DB | Neon PostgreSQL | Serverless-friendly PostgreSQL for Vercel. One Neon project/database per client deployment. |
| Realtime | Pusher | Simple realtime fan-out after committed server mutations. Avoids building websocket infrastructure. |
| UI | shadcn/ui + Tailwind | Fast component assembly, customizable, mobile-first friendly, no heavy design system overhead. |
| Toasts | Sonner | Good fit for progress save, undo, retry, and error feedback. |
| Forms | React Hook Form + Zod | Needed for PO creation, user creation, profile PIN change, Superadmin config, and validation. |
| Charts | Recharts | Enough for KPI cards, bar chart, horizontal bottleneck chart, and donut chart. |
| PDF | Server-side generator | Required because exports need watermark and controlled output. |
| Monitoring | Sentry | Needed because production failure can disrupt factory operations. |
| Tests | Vitest + Playwright | Unit-test workflow rules; E2E-test critical role flows. |

---

## 4. Deployment Architecture

### Model

```txt
One factory client = one independent Vercel project + one independent Neon database.
```

### Required Properties

- No shared production database between clients.
- No `tenantId`-based multi-tenant logic for v1.
- No cross-client admin dashboard in the app runtime.
- Superadmin config exists inside each deployment.
- Billing/subscription status is stored per deployment/workspace.

### Environment Layout

```txt
Local development:
- Next.js dev server
- Local PostgreSQL
- Local .env

Preview deployment:
- Vercel preview URL
- Separate preview Neon branch or preview database

Production deployment:
- Vercel production domain
- Production Neon database
- Pusher production app/channel
- Sentry production project
```

### Required Environment Variables

```txt
DATABASE_URL=
DIRECT_URL=
SESSION_SECRET=
PIN_HASH_PEPPER=
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
SENTRY_DSN=
NEXT_PUBLIC_APP_URL=
```

Notes:

- `SESSION_SECRET` signs staff and Superadmin sessions.
- `PIN_HASH_PEPPER` is optional but recommended as an extra secret beyond bcrypt hashing.
- `DIRECT_URL` is useful for Prisma migrations with Neon.
- Public Pusher keys are allowed client-side; secrets must stay server-side only.

---

## 5. Database and Data Integrity Stack

### Database

Use PostgreSQL as the source of truth.

### Prisma Responsibilities

Prisma owns:

- Schema definitions.
- Migrations.
- Typed queries.
- Transaction boundaries.
- Data relation enforcement.

### Required Transaction Pattern

All operational mutations must run inside a database transaction:

```txt
validate permission
validate current state
validate quantity/progress invariant
write domain mutation
write audit log
write notification if required
commit transaction
trigger realtime event after commit
```

Never trigger realtime before the database commit succeeds.

### Critical Invariants

The stack must enforce these at server level, not only UI level:

```txt
progress cannot decrease
completed quantity cannot exceed total quantity
moved-forward quantity cannot exceed completed quantity
QC split total must equal item quantity
DONE item is terminal
Finance cannot see return item until re-delivered and DONE
Admin override must create ADMIN_OVERRIDE audit log
5-second cancelled local update must not create audit log or realtime event
```

---

## 6. Authentication and Session Stack

### Auth Type

Use custom authentication. Do not use email/password auth providers.

Reason: POgrid login is department/role → user name → numeric PIN pad. It is a factory-floor login model, not a SaaS email login model.

### Session Storage

Use signed httpOnly cookie sessions.

Recommended payload:

```txt
userId
role
departmentId optional
workspaceId
sessionVersion
issuedAt
```

### PRD Rule

The synced PRD says staff sessions never expire and logout is explicit. Therefore do not add automatic expiry unless the PRD is intentionally changed later.

### PIN Rules

```txt
Factory staff: 4-digit numeric PIN
Superadmin: 6-digit numeric PIN
Storage: hashed only
No plain text PIN persistence
```

### PIN Reset / Change

- Admin reset generates a new memorable PIN and displays it once.
- User self-change from Profile does not require old PIN, per PRD.
- Every PIN reset/change writes audit log.

### Rate Limiting

Even if sessions do not expire, login attempts must be rate-limited:

```txt
scope: workspace + user + IP/device signal
trigger: wrong PIN attempts
result: cooldown / temporary lockout
```

This protects public `/login` and hidden `/superadmin` routes.

---

## 7. Realtime and Sync Stack

### Realtime Provider

Use Pusher for realtime fan-out.

### Rule

Realtime events fire only after confirmed server commit.

### Event Categories

```txt
PO_CREATED
ITEM_STAGE_ADVANCED
PROGRESS_UPDATED
PROBLEM_REPORTED
PROBLEM_RESOLVED
QC_DECISION_SUBMITTED
REWORK_SPAWNED
RETURN_SPAWNED
ITEM_DONE
FINANCE_STATUS_UPDATED
NOTIFICATION_CREATED
```

### 5-Second Cancel Window

This is a client-side pre-commit delay:

```txt
tap update
show optimistic local state
show undo toast for 5 seconds
if undo tapped: discard local change
if no undo: send mutation to server
server validates and commits
server writes audit log
server writes notification if needed
server triggers realtime event
```

### Offline / Poor Connection Behavior

For v1, implement a small local mutation queue for operator updates only:

```txt
pending
confirmed
failed
retrying
```

Use IndexedDB via a small wrapper only if needed. Avoid adding heavy offline frameworks. The app is not full offline-first ERP; it only needs to protect operator tap updates from bad factory-floor connectivity.

Recommended library:

```txt
idb-keyval
```

Use this only for queued unsynced mutations, not for long-term app state.

---

## 8. Frontend State Strategy

### Server State

Use direct server fetches and route handlers first.

For complex client-side caching, use TanStack Query only if the implementation has already become difficult without it.

Default v1 recommendation:

```txt
No TanStack Query at start.
Use small custom hooks for role screens and optimistic progress.
```

Reason: POgrid has custom rules: 5-second cancel window, progress floor, audit timing, and realtime-after-commit. A hand-rolled state machine is clearer for AI agents.

### Required Hooks

```txt
useSession
useRoleGuard
useOptimisticProgress
useMutationQueue
usePusherChannel
useNotifications
useDebouncedSearch
```

### UI State Rule

Do not let local state become source of truth. Server-confirmed value is the baseline. Local state is only temporary visual feedback until commit.

---

## 9. UI Stack and Design System

### UI Foundation

```txt
Tailwind CSS
shadcn/ui
Lucide React
Sonner
```

### Design Direction

- Mobile-first.
- Card-based layouts.
- Bottom sheets for actions and confirmations.
- Bottom navigation by role.
- Notification bell on every main screen.
- Shared item detail/task card pattern across task list, board, PO detail, finance, and dashboard drilldowns.
- Bahasa Indonesia UI labels.

### Required Base Components

```txt
AppShell
RoleBottomNav
TopBarWithNotificationBell
NotificationDrawer
ItemCard
ItemDetailSheet
ProgressStepper
QuantityStepper
StageProgressSnapshot
UrgencyLeftBorder
ProblemBadge
ReworkBadge
ReturnBadge
ConfirmSheet
AuditLogSheet
MutationStatus
CancelToast
ErrorRetryToast
```

### Mobile Rules

```txt
minimum touch target: 44px
preferred touch target: 48px
no typing for routine operator actions
numeric keypad for PIN and quantities
bottom sheets over modals on mobile
no blocking spinner after tap
always show sync status
```

---

## 10. API and Server Mutation Design

Use Next.js Route Handlers or Server Actions. For POgrid, Route Handlers are recommended for clearer AI-agent boundaries.

Recommended route structure:

```txt
/api/auth/login
/api/auth/logout
/api/auth/change-pin
/api/pos
/api/pos/[id]
/api/pos/[id]/delete
/api/items/[id]
/api/items/[id]/progress
/api/items/[id]/drawing
/api/items/[id]/purchasing
/api/items/[id]/qc
/api/items/[id]/delivery
/api/items/[id]/return
/api/problems
/api/problems/[id]/resolve
/api/finance/items
/api/finance/items/[id]/status
/api/notifications
/api/notifications/read
/api/dashboard/kpis
/api/dashboard/charts
/api/settings/users
/api/settings/clients
/api/superadmin/config
```

### Mutation Response Shape

Every mutation should return predictable status:

```txt
{
  ok: boolean,
  data?: object,
  error?: {
    code: string,
    message: string
  },
  auditId?: string,
  serverConfirmedAt?: string
}
```

Error messages shown in UI must come from centralized Bahasa Indonesia message strings.

---

## 11. Security Baseline

POgrid is internal, but it is still exposed through a public domain. Treat it as a real production system.

### Required Controls

```txt
https only
httpOnly secure cookies
sameSite=lax or strict
CSRF protection for mutating requests
server-side role guards on every protected route
rate limit login and PIN attempts
rate limit mutation endpoints lightly
bcrypt-hashed PINs
no plain text PIN in database or logs
no file uploads
no public client data routes
no client portal
no monetary fields
input validation with Zod on every mutation
security headers
Sentry error monitoring
append-only audit logs
```

### Role Guard Rule

UI hiding is not security. Every protected server mutation must verify:

```txt
valid session
active user
role permission
department ownership if applicable
item current stage
allowed transition
```

### Superadmin Route

```txt
/superadmin
```

Rules:

- Hidden from normal UI.
- Separate 6-digit PIN.
- Stronger rate limit than staff PIN.
- PIN re-confirmation for destructive actions.
- No normal factory staff role should access it.

---

## 12. PDF Export Stack

PRD requires server-side PDF export with watermark.

Recommended options:

### Option A — React PDF

Good for structured reports with tables and predictable layout.

```txt
@react-pdf/renderer
```

### Option B — Playwright PDF

Good if export should match actual dashboard UI.

```txt
playwright
```

Recommended v1 choice:

```txt
React PDF for report export.
```

Reason: simpler on Vercel, less browser-runtime complexity, better for controlled watermark text.

Every export page must include:

```txt
Exported by [User Name] · [Date & Time]
```

---

## 13. Analytics Stack

Use server-side aggregation queries through Prisma/PostgreSQL.

Do not compute KPI truth from client-side cached lists.

### KPI Data Source Rules

```txt
Total POs: PO createdAt in period
On-Time %: delivery timestamp versus due date
Avg Lead Time: item DONE timestamp minus PO creation timestamp
Overdue Items: dynamic due-date flag calculation
Rework Items: item rework flag
Stalled Items: last progress update older than 24 hours
Bottleneck: average dwell time by department/stage timestamps
```

### Chart Library

Use Recharts.

Keep chart components simple and drillable. Every KPI and chart segment must link to the underlying PO/item list.

---

## 14. Testing Strategy

### Unit Tests

Use Vitest for pure logic:

```txt
urgency calculation
role permission matrix
stage transition rules
quantity/progress invariants
QC pass/minor/major paths
finance status transitions
return visibility rule
PO status computation
audit event generation
```

### Component Tests

Use React Testing Library for:

```txt
PIN pad
progress stepper
quantity stepper
QC split form
notification drawer
role bottom nav
confirm sheets
```

### E2E Tests

Use Playwright for critical flows:

```txt
login department → user → PIN
admin creates PO
operator updates progress with 5-second cancel
operator commits progress
item auto-advances to QC after all production departments reach 100%
QC pass advances to Delivery
delivery marks DONE
finance marks invoiced and paid
problem report and resolve
admin delete guard blocks DONE/PAID PO
```

---

## 15. Development Rules for AI Agents

### Package Manager

```txt
npm only
```

Never use pnpm or yarn commands.

### Agent Reading Order

Before implementation, agent must read:

```txt
POgrid_PRD_Factorized_synced.md
POgrid_TECH_STACK_SYNCED.md
00_AGENT_README.md
07_IMPLEMENTATION_GUARDRAILS.md
18_CONFIRMED_NAV_SETTINGS_NOTIFICATIONS.md
```

### Agent Must Not Add

```txt
money fields
invoice amounts
file uploads
client portal
generic Kanban behavior
email/password login
OAuth login
WhatsApp workflow notifications
AI forecasting
BOM/MRP/inventory system
per-user item assignment
Gantt chart
```

### Agent Must Preserve

```txt
single-tenant deployment
role-based home routes
department → user → PIN login
shared item/task card logic
all roles can view Board
only authorized roles mutate their own workflow slice
confirmed mutations write audit logs
realtime after commit only
5-second undo before commit
Bahasa Indonesia UI
mobile-first layout
```

---

## 16. Recommended Folder Boundaries

```txt
src/
  app/
    login/
    dashboard/
    pos/
    po/
    tasks/
    board/
    problems/
    finance/
    profile/
    settings/
    superadmin/
    demo/
    api/
  components/
    app-shell/
    auth/
    board/
    dashboard/
    finance/
    item/
    notifications/
    po/
    problems/
    profile/
    settings/
    superadmin/
    ui/
  hooks/
  lib/
    auth/
    audit/
    db/
    permissions/
    realtime/
    security/
    validators/
    workflow/
  styles/
  tests/
```

### Boundary Rule

Workflow logic belongs in `lib/workflow`, not inside React components.

React components render UI and call mutations. They do not decide whether a stage transition is legal.

---

## 17. Final Stack Lock

Use this stack unless a concrete PRD constraint forces change:

```txt
Next.js App Router
TypeScript
npm
Prisma
PostgreSQL local
Neon PostgreSQL hosted
Vercel single-tenant deployment per client
Pusher realtime
Tailwind CSS
shadcn/ui
Sonner
React Hook Form
Zod
Lucide React
Recharts
React PDF
Sentry
Vitest
React Testing Library
Playwright
```

Any proposed new dependency must answer:

1. Which PRD requirement does it directly serve?
2. Can the same result be done with the current stack?
3. Does it increase factory-floor reliability or reduce it?
4. Does it make AI-agent implementation clearer or more confusing?

If the answer is unclear, do not add it.
