# POgrid — ROADMAP.md

> Purpose: implementation roadmap for AI agentic coding from empty project to deployable internal production-tracking app.  
> Source of truth: synced PRD, synced tech stack, and synced shadcn/ui UX system.  
> Rule: this roadmap must not change product logic. It only orders implementation work.

---

## 0. Roadmap Philosophy

POgrid must be built as **vertical slices**, not as isolated horizontal layers.

A phase is complete only when a real user flow works end-to-end:

```txt
UI action → permission check → server validation → database mutation → audit log → notification if required → realtime event after commit → visible UI update
```

Do not build beautiful screens that do not mutate real data.  
Do not build backend endpoints without the mobile-first shadcn UI that uses them.  
Do not defer security, audit logging, or role permissions to the end.

---

## 1. Locked Product Rules

These rules apply to every phase.

### 1.1 Product Scope Locks

- Internal factory app only.
- No external client portal.
- No monetary values anywhere.
- No file uploads or attachments.
- No ERP, accounting, BOM, MRP, Gantt chart, AI forecasting, IoT, barcode, WhatsApp workflow notification, email, Telegram, or push notification.
- In-app notifications only.
- WhatsApp is allowed only for Forgot PIN deep link to Admin.
- UI language is Bahasa Indonesia.
- PRD and agent docs may be English.

### 1.2 Deployment Locks

- One factory client = one Vercel deployment.
- One factory client = one isolated Neon PostgreSQL database.
- No shared production database between clients.
- No tenant-switching UI in v1.
- Superadmin exists inside each deployment through hidden `/superadmin` route only.

### 1.3 UX Locks

- Mobile-first first, desktop second.
- shadcn/ui is the only UI component foundation.
- Drawer-first mobile actions.
- Bottom navigation for authenticated staff pages.
- Shared item/task card pattern across Tasks, Board, PO Detail, Finance, and dashboards.
- Tap-first controls. Avoid typing where steppers, chips, buttons, and selectors work.
- Minimum touch target: 44px.
- Visible sync state for operational updates.
- Sonner toast for save, undo, retry, and error feedback.

### 1.4 Workflow Locks

- Items are assigned to departments, not individual users.
- All roles can view the Board.
- Operators can only update their own department/stage action.
- Admin can override but every override must be audit logged as `ADMIN_OVERRIDE`.
- Production departments work in parallel.
- Item advances to QC only when all assigned production department progress reaches 100%.
- QC is an explicit gate. No auto-pass.
- Delivery makes item DONE.
- DONE is terminal.
- Finance works at item level, not PO level.
- Finance stores invoice state only: `PENDING`, `INVOICED`, `PAID`.
- Finance stores no amount, price, cost, tax, or payment value.
- Problems never block production.
- Rework and return lineage are permanent.

---

## 2. Locked Technical Stack

```txt
Framework:              Next.js App Router
Language:               TypeScript
Package manager:        npm only
UI:                     React + Tailwind CSS + shadcn/ui
Feedback:               Sonner
Icons:                  Lucide React
Forms:                  React Hook Form + Zod
Database ORM:           Prisma
Local database:         PostgreSQL local
Hosted database:        Neon PostgreSQL
Deployment:             Vercel per client
Realtime:               Pusher
Auth:                   Custom PIN auth + httpOnly cookie session
PIN hashing:            bcrypt or bcryptjs
Charts:                 Recharts
PDF export:             Server-side PDF generation
Monitoring:             Sentry
Testing:                Vitest + React Testing Library + Playwright
Lint/format:            ESLint + Prettier
Timezone:               Asia/Jakarta factory rules
```

No MUI, Ant Design, DaisyUI, Chakra, Bootstrap, Flowbite, Supabase Auth, Clerk, Auth.js email login, Firebase, MongoDB, or Docker-first deployment for v1.

---

## 3. Phase Gate Format

Each phase must produce:

1. working UI,
2. working database state,
3. server-side permission checks,
4. audit logs for confirmed mutations,
5. realtime event where relevant,
6. in-app notification where relevant,
7. mobile-first shadcn UI,
8. tests for critical workflow rules,
9. manual QA checklist passed.

A phase is not done if it only creates components, mock screens, database models, or routes without connecting the full flow.

---

# PHASE 0 — Project Foundation

## Goal

Create a clean, stable Next.js foundation that future agents can safely extend without stack drift.

## Build Scope

### App Foundation

- Initialize Next.js App Router project.
- Enable TypeScript strict mode.
- Use npm only.
- Install and configure Tailwind CSS.
- Install and configure shadcn/ui.
- Install Lucide React.
- Install Sonner.
- Install React Hook Form and Zod.
- Install Prisma.
- Configure PostgreSQL local development.
- Prepare Neon-compatible environment variables.
- Add ESLint and Prettier.
- Add base folder structure.

### Design Foundation

- Create POgrid shadcn theme tokens.
- Create global app shell.
- Create authenticated page shell placeholder.
- Create top app bar placeholder.
- Create bottom navigation placeholder.
- Create notification bell placeholder.
- Create loading skeleton pattern.
- Create empty/error state pattern.
- Add POgrid animated loader reference if already available.

### Security Foundation

- Create environment variable validation.
- Create secure cookie helper.
- Create role constants.
- Create permission guard skeleton.
- Create server-only database client wrapper.
- Ensure no secrets are exposed to client bundle.

## Required Manual Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
```

## Acceptance Checklist

- App boots locally.
- shadcn components render correctly.
- Tailwind tokens are available.
- No second UI library exists.
- Bottom navigation shell exists but may not yet be role-aware.
- Top bar exists with placeholder notification bell.
- Local PostgreSQL connection is documented but schema can still be minimal.
- No product logic has been invented beyond the PRD.

## Stop Conditions

Stop and fix before continuing if:

- pnpm or yarn is introduced.
- non-shadcn UI library is added.
- auth provider replaces PIN login.
- Docker becomes required for local development.

---

# PHASE 1 — Core Data Model, Seed, Auth, and Role Login

## Goal

Make real users log in through the factory PIN flow and land on correct role home routes.

## Build Scope

### Database

Create core schema for:

- Workspace
- Department
- User
- Client
- Production Order
- Item
- ItemProgress
- Problem
- AuditLog
- Notification

The schema may include finance, QC, rework, return, and stage fields from the beginning to reduce migration churn, but UI can expose them in later phases.

### Seed Data

Seed one workspace with:

- Superadmin user with 6-digit PIN hash.
- Admin user.
- Owner / Manager / Sales users.
- Drafter user.
- Purchasing user.
- Machining operator.
- Fabrikasi operator.
- QC user.
- Delivery user.
- Finance user.
- Active departments:
  - Drafting
  - Purchasing
  - Machining
  - Fabrikasi
  - QC
  - Delivery
  - Finance

### Authentication

Implement exact login flow:

```txt
Department / Role icon → active users in that department → user tap → numeric PIN pad → role home route
```

Required auth rules:

- No text input for worker login PIN.
- Numeric PIN pad only.
- Factory staff PIN: 4 digits.
- Superadmin PIN: 6 digits.
- PIN stored hashed only.
- Session via httpOnly signed cookie.
- Staff sessions never expire.
- Logout only explicit.
- Wrong PIN triggers shake animation and brief cooldown.
- Forgot PIN opens WhatsApp deep link to Admin number only.
- Superadmin login is hidden under `/superadmin`, never shown in public login.

### Role Home Redirects

- ADMIN → `/pos`
- OWNER / MANAGER / SALES → `/dashboard`
- FINANCE → `/finance`
- DRAFTER / PURCHASING / OPERATOR / QC / DELIVERY → `/tasks`

### UI

- `/login` mobile-first role icon grid.
- User selection drawer.
- PIN pad drawer/panel.
- Error state in Bahasa Indonesia.
- `/superadmin` hidden PIN route.
- Role-aware authenticated shell after login.
- Bottom nav displays correct role nav after login.
- `/profile` page with logout placeholder and PIN change placeholder.

## Acceptance Checklist

- User can log in without typing text.
- User lands on correct home route.
- Superadmin is not visible on normal login.
- Wrong PIN does not create session.
- PIN hashes are never logged or shown except generated temporary PIN display when intended later.
- Role guard blocks unauthorized pages.
- Bottom nav follows role group.
- UI copy is Bahasa Indonesia.

## Test Requirements

- Unit: PIN validation length.
- Unit: role → route mapping.
- Unit: permission guard denies wrong role.
- E2E: Admin login.
- E2E: Operator login.
- E2E: Superadmin hidden route login.
- E2E: wrong PIN cooldown visible.

---

# PHASE 2 — Admin PO Creation and First Visible Production Loop

## Goal

Admin can create a PO, items appear immediately to relevant operators and all-role Board, and production operators can update progress.

## Build Scope

### Admin PO Creation

Implement `/pos`, `/po`, `/pos/new`, `/pos/[id]` minimum usable version.

PO creation fields:

- Internal PO Number: auto-generated, editable.
- Client PO Number: optional.
- Customer: searchable dropdown.
- Add New Customer inline drawer.
- PO Date: autofill today.
- Delivery Deadline: optional date picker.
- Notes: optional.
- Urgent toggle.
- Vendor Job toggle.

Per-item fields:

- Item name.
- Specification optional.
- Quantity numeric stepper.
- Unit default `pcs`.
- Production departments multi-select from configured active production departments.

Validation:

- Required fields show red border on submit.
- No auto-scroll to first error.

On success:

- Redirect to new PO detail.
- Urgency computed immediately.
- Items visible on Board to all roles.
- Relevant operators receive in-app notification.
- Audit log created.

### Production Progress Loop

For assigned production departments:

- ItemProgress exists per item × department.
- Operator sees relevant tasks in `/tasks`.
- Operator sees full item context but can only update own department progress.
- Qty = 1 uses 0–100 slider.
- Qty > 1 uses completed quantity stepper.
- Quick add: +5, +10, +20, All.
- Progress cannot decrease.
- Fresh fetch on item open.
- 5-second cancel window before server write.
- Realtime event fires only after cancel window closes and server commit succeeds.
- Last write wins at server arrival order.
- Every confirmed progress update writes audit log.

### Shared Item UI

Create shared components:

- `ItemTaskCard`
- `ItemDetailDrawer`
- `ProgressSnapshot`
- `ProgressStepper`
- `UrgencyAccent`
- `StageBadge`
- `SyncStatusBadge`

These must be reusable by Tasks, Board, PO Detail, and later Finance.

### Board

Implement `/board` as global floor view:

- All roles can access.
- All items visible.
- Role-specific actions still restricted.
- Filters can be minimal but must not hide the shared status truth.

## Acceptance Checklist

- Admin creates a real PO with multiple items.
- Operator sees the item without refresh if realtime is active, or after refresh if realtime unavailable.
- Operator can update only their own department.
- Other department progress is read-only.
- Progress cannot go backward.
- Cancel within 5 seconds creates no database write, audit log, or realtime event.
- Confirmed update creates audit log and realtime event.
- Board shows same item state as Tasks and PO Detail.
- No monetary fields exist.
- No upload field exists.

## Test Requirements

- Unit: quantity → progress conversion.
- Unit: progress cannot decrease.
- Unit: assigned department permission.
- Unit: urgency sorting.
- Integration: create PO creates item progress rows.
- Integration: progress commit creates audit log.
- Integration: cancel update creates no audit log.
- E2E: Admin creates PO → Operator updates progress → Board updates.

---

# PHASE 3 — Drafting and Purchasing Stages

## Goal

Add the pre-production flow without breaking the production loop.

## Build Scope

### Drafting

Drafter task panel actions:

- Approve Drawing.
- Request Redraw.

Rules:

- Approve Drawing advances item to Purchasing.
- Request Redraw keeps item in Drafting.
- Revision count increments.
- System creates problem.
- Admin + Manager notified.
- Audit log created.
- If no active DRAFTER user exists, Drafting auto-advances to Purchasing on PO creation.

### Purchasing

Purchasing task panel:

- Order placed = 33%.
- Vendor confirmed = 66%.
- Material arrived = 100%.

Rules:

- Cannot go backward.
- Purchasing is non-blocking.
- Item can enter Production before Purchasing is 100%.
- If production starts before purchasing complete, system auto-creates a problem.
- System problem auto-resolves when purchasing reaches 100%.

### UI

- Add role-specific panels inside shared `ItemDetailDrawer`.
- Drafter panel uses two primary action buttons.
- Purchasing panel uses three tap milestones, not free text.
- All copy Bahasa Indonesia.

## Acceptance Checklist

- Item starts at Drafting unless bypass rule applies.
- Drafter approval moves to Purchasing.
- Redraw increments revision and creates problem.
- Purchasing milestones move forward only.
- Production can begin before purchasing complete.
- System anomaly problem appears and auto-resolves correctly.
- All transitions write audit logs.
- Notifications target correct roles.

## Test Requirements

- Unit: Drafting bypass rule.
- Unit: purchasing milestone cannot decrease.
- Integration: redraw creates problem and notification.
- Integration: production-before-purchasing creates system problem.
- Integration: purchasing 100 auto-resolves system problem.
- E2E: PO creation → Drafter approve → Purchasing milestones → Production task visible.

---

# PHASE 4 — QC Gate and Rework Logic

## Goal

Implement the explicit QC decision gate and permanent rework lineage.

## Build Scope

### QC Queue

- QC users see items that reached QC.
- QC cannot auto-pass items.
- QC must submit decision.

### QC Panel

Use drawer panel with quantity split:

- Pass quantity.
- Minor defect quantity.
- Major defect quantity.

Validation:

- Total must equal item quantity.
- Major defect requires predefined reason.
- Other reason requires text note.

### Path A — All Pass

- Item advances to Delivery.
- QC pass timestamp recorded.
- Audit log created.
- Realtime event fires.

### Path B — Minor Defect

- Item stays in QC.
- QC progress resets to 0.
- Permanent rework badge added.
- Rework type = MINOR.
- Admin + Manager notified.
- Audit log created.

### Path C — Major Defect

Partial fail:

- Original item quantity becomes passing quantity and advances to Delivery.
- New child item is spawned for failing quantity.
- Child item status = PRODUCTION.
- Child production progress reset to 0.
- Child marked rework type = MAJOR.
- Lineage pill references immediate parent.

Total fail:

- Original item remains.
- New child item spawned with original full quantity.
- Follow PRD lineage rule exactly.

### Rework Reasons

- Dimensions out of spec.
- Surface / finishing defect.
- Crack or fracture.
- Wrong material.
- Other.

## Acceptance Checklist

- QC item does not advance without explicit decision.
- QC split cannot submit unless total equals item quantity.
- Minor defect keeps item in QC and marks permanent rework.
- Major defect spawns child item correctly.
- Rework badge never disappears.
- Parent/child lineage pill is visible.
- Audit logs are complete.
- Notifications target Admin + Manager.

## Test Requirements

- Unit: QC split total invariant.
- Unit: major defect child quantity.
- Unit: rework badge permanence.
- Integration: QC pass advances to Delivery.
- Integration: minor defect stays in QC.
- Integration: major defect spawns child and logs audit.
- E2E: Production 100% → QC queue → major defect → child visible in Production.

---

# PHASE 5 — Delivery, DONE Terminal State, and Client Return

## Goal

Complete the physical production lifecycle through Delivery and handle client returns without mutating DONE items.

## Build Scope

### Delivery Queue

Delivery users see items that passed QC.

Delivery panel:

- Confirm shipped quantity.
- Mark item DONE after confirmation.
- Notify Finance, Owner, Manager.
- Audit log created.

### DONE Rule

- DONE is terminal.
- DONE item cannot be edited backward.
- DONE item cannot re-enter production directly.

### Client Return Protocol

Delivery can trigger client return:

- Original DONE item is never modified.
- New child item is spawned.
- Source = RETURN.
- Status = PRODUCTION.
- Child re-enters full production pipeline.
- Finance notified original item pending re-delivery.
- Return child hidden from Finance until DONE again.
- On re-delivery, appears in Finance with red RETURN badge.

### UI

- Return action lives in Delivery panel only.
- Return confirmation drawer explains consequence.
- Red RETURN lineage pill visible to all roles.

## Acceptance Checklist

- Delivery confirmation moves item to DONE.
- DONE item cannot be moved backward.
- Finance receives item after DONE.
- Client return spawns child item.
- Return child enters Production, not Finance.
- Original DONE item is not mutated.
- Return badge persists after re-delivery.
- Audit logs record delivery and return spawn.

## Test Requirements

- Unit: DONE terminal guard.
- Unit: return child lineage.
- Integration: delivery creates finance pending state.
- Integration: return child hidden from Finance until DONE.
- E2E: QC pass → Delivery → DONE → Finance Pending.
- E2E: Trigger return → child in Production → re-deliver → Finance Pending with RETURN badge.

---

# PHASE 6 — Finance Item-Level Workflow

## Goal

Implement item-level invoice status tracking without monetary values.

## Build Scope

### Finance Dashboard `/finance`

Summary header:

- Pending count.
- Invoiced count.
- Paid count.

Filters:

- Global search: item name, client name, PO number.
- Client dropdown.

Tabs:

- Pending.
- Invoiced.
- Paid.

Actions:

- Pending → Mark as Invoiced.
- Invoiced → Mark as Paid.
- Paid → Reverse to Invoiced.

Rules:

- Every action requires bottom sheet confirmation.
- Every transition writes audit log.
- No money fields.
- No invoice document upload.
- Return items hidden until re-delivered and DONE.

### PO Status Auto-Computation

- All items PAID → PO status = CLOSED.
- All items DONE but not all PAID → PO status = FINISHED.
- Otherwise → PO status = ACTIVE.

### UI

- Finance uses same item card/detail pattern where possible.
- Finance panel is read-only for production state and action-only for invoice state.
- Red RETURN badge appears for re-delivered return items.

## Acceptance Checklist

- Finance sees DONE items as Pending.
- Finance can mark Pending → Invoiced.
- Finance can mark Invoiced → Paid.
- Finance can reverse Paid → Invoiced.
- PO status computes correctly.
- Finance cannot see active return child before DONE.
- No amount, price, tax, cost, or payment field exists.

## Test Requirements

- Unit: PO status computation.
- Unit: finance transition permissions.
- Integration: item DONE creates Pending finance state.
- Integration: Paid transition logs audit.
- E2E: Delivery DONE → Finance Pending → Invoiced → Paid → PO Closed.

---

# PHASE 7 — Problem Reporting and Resolution Center

## Goal

Make problems visible and manageable without blocking production.

## Build Scope

### Problem Reporting

Any operator can report problem on any item.

Problem categories:

- Material not arrived.
- Material mismatch.
- Machine/tool failure.
- Operator unavailable.
- Drawing/spec unclear.
- Other.

Rules:

- Other requires free-text note.
- Problems never block production.
- Problem creates in-app notification for Owner, Manager, Admin.
- Audit log created.

### Resolution

Can resolve:

- reporter,
- same-stage operator,
- Admin,
- Manager.

Resolution:

- one-tap resolve allowed,
- optional resolution note,
- audit log created.

### `/problems`

Admin problem center:

- Lists all open problems.
- Sorts most severe + most overdue first.
- Filters by PO, department, urgency.
- Resolve via confirmation drawer.

### UI

- Problem badge visible on item cards.
- Problem list inside ItemDetailDrawer.
- Report Problem drawer uses chips and minimal typing.

## Acceptance Checklist

- Operator can report problem.
- Problem does not stop progress updates.
- Admin problem center lists open problems.
- Reporter can resolve own problem.
- Unauthorized user cannot resolve unrelated problem.
- System problems are visually marked as system-generated.
- Audit logs are written.

## Test Requirements

- Unit: problem resolution permission.
- Unit: Other category note requirement.
- Integration: report problem creates notification.
- Integration: resolve problem writes audit log.
- E2E: Operator reports problem → Admin sees it → Manager resolves.

---

# PHASE 8 — Notifications, Realtime Polish, and Sync Recovery

## Goal

Complete the in-app notification and realtime visibility system.

## Build Scope

### Notification Bell

- Top bar bell icon.
- Unread count badge.
- Opens Drawer on mobile, Sheet on desktop.
- Newest first.
- Tap notification navigates to related PO/item.
- Mark read on tap or explicit action.

### Notification Events

Implement all PRD notification events:

- New PO created → all relevant operators.
- Item advances to new stage → next-stage operators.
- Problem reported → Owner, Manager, Admin.
- Drawing redraw → Admin, Manager.
- Urgency flag escalates → Owner, Manager, Admin.
- Item marked Rework → Owner, Manager, Admin.
- Item DONE → Finance, Owner, Manager.
- Finance marks PAID → Owner, Manager.

### Realtime

- Pusher events fire after DB commit only.
- Events update relevant lists/cards.
- No realtime event for cancelled 5-second update.
- Add visible connection/sync indicator.

### Sync Failure

- Failed mutation shows Bahasa Indonesia error toast.
- One-tap retry available where safe.
- UI must not silently lose operator action.
- If retry fails, user sees clear failed state.

## Acceptance Checklist

- Bell count updates after new notification.
- Notifications route to correct item/PO.
- Mark read works.
- Pusher update changes visible item card.
- Disconnected state is visible.
- Cancelled update produces no notification/realtime event.
- Failed update shows retry state.

## Test Requirements

- Unit: notification targeting by event.
- Integration: stage advance creates correct notification.
- Integration: notification read state changes count.
- E2E: Operator update → Manager Board updates.
- E2E: Problem reported → Admin bell increments.

---

# PHASE 9 — Analytics Dashboard, Board Maturity, and PDF Export

## Goal

Deliver management visibility: KPI dashboard, bottleneck detection, global Board refinement, and export.

## Build Scope

### Analytics `/dashboard`

Access:

- ADMIN.
- OWNER.
- MANAGER.
- SALES.

Period filter:

- 1 Month.
- 3 Months default.
- 6 Months.
- 12 Months.

KPI cards:

- Total POs.
- On-Time %.
- Avg Lead Time.
- Total Overdue Items.
- Total Rework Items.
- Stalled Items.

Charts:

- On-Time vs Late grouped bar by month.
- Bottleneck by Department horizontal bar using avg dwell days.
- Rework Reasons donut.

Sticky summary bar:

```txt
[n] PO Aktif · [n]% Tepat Waktu · Bottleneck: [DEPT]
```

### Board Refinement

- Global floor view all items all stages.
- Sort by urgency.
- Show stage timeline dots.
- Show progress snapshot across departments.
- Read-only for users outside their own action permission.
- Shared item drawer opens same source of truth.

### PDF Export

Available to:

- ADMIN.
- OWNER.
- MANAGER.
- SALES.

Rules:

- Server-side generated.
- Watermark on every page: exported by user name + date/time.
- No monetary values.
- Export only analytics/status, not hidden secrets.

## Acceptance Checklist

- Dashboard metrics match database state.
- Period filter changes KPI and charts.
- Bottleneck uses dwell timestamps.
- Stalled items computed live, not stored.
- Board shows same truth as task and PO pages.
- PDF export includes watermark.
- Finance cannot access analytics.

## Test Requirements

- Unit: KPI calculations.
- Unit: dwell time by department.
- Unit: stalled item computation.
- Integration: dashboard API respects period.
- Integration: PDF export includes watermark.
- E2E: Manager opens dashboard and exports PDF.

---

# PHASE 10 — Admin Settings and Superadmin Configuration

## Goal

Complete workspace management without exposing Superadmin in normal factory UI.

## Build Scope

### Admin Settings `/settings`

Tabbed one-page settings:

- Users.
- Clients.
- Flags.

Users tab:

- List users.
- Add user inline.
- Assign role/department.
- Toggle active/inactive.
- Reset PIN.
- Generated PIN displayed inline before closing.
- Audit logs: `USER_CREATED`, `USER_TOGGLED`, `PIN_RESET`.

Clients tab:

- Client list.
- Add client.
- Edit client.
- Keep minimal. No external portal logic.

Flags tab:

- Read-only threshold view.
- Explain thresholds are set by platform owner.

### Profile `/profile`

All authenticated users:

- View name and role.
- Change own display name if allowed by synced PRD/UI file.
- Change own PIN without old PIN.
- Logout.
- Audit log: `SELF_PIN_CHANGE`.

### Superadmin `/superadmin`

Hidden route only.

Capabilities:

- Workspace branding.
- Configure production departments.
- Dynamic operator roles synced to departments.
- PO number template.
- Urgency thresholds.
- Admin WhatsApp number for Forgot PIN.
- Database seed/reset with PIN re-confirmation.
- Billing/subscription status.

Rules:

- Superadmin is not linked from normal UI.
- Reset/destructive actions require PIN re-confirmation.
- Department changes must not corrupt existing item history.

## Acceptance Checklist

- Admin can add user and see generated PIN once.
- Admin can reset PIN and see generated PIN once.
- Admin can toggle user active/inactive.
- User can change own PIN from Profile.
- Superadmin can configure workspace without appearing in public login.
- Department config syncs operator role availability.
- Existing historical data remains readable after department deactivation.

## Test Requirements

- Unit: generated PIN format.
- Unit: dynamic role name generation.
- Unit: active/inactive login restriction.
- Integration: reset PIN writes audit log.
- Integration: self PIN change writes audit log.
- E2E: Admin creates user → new user logs in.
- E2E: Superadmin changes threshold → urgency recalculates.

---

# PHASE 11 — Security Hardening, Audit Integrity, and Production Reliability

## Goal

Harden the app for internal production use on a public domain.

## Build Scope

### Security

- Server-side permission checks on every mutation.
- Rate limit login attempts.
- Rate limit sensitive endpoints.
- CSRF protection strategy for cookie-auth mutations.
- Secure cookie flags.
- Input validation via Zod on server.
- No trust in client-supplied role, userId, departmentId, progress floor, or item status.
- Prevent unauthorized direct URL access.
- Prevent inactive users from logging in.
- Protect Superadmin route separately.

### Audit Integrity

- AuditLog append-only.
- No delete/edit audit UI.
- Every significant action has audit entry.
- Admin overrides clearly marked.
- Include before/after values where applicable.

### Reliability

- Health endpoint.
- Sentry installed.
- Error boundaries.
- Graceful Pusher fallback: app still works with refresh if realtime fails.
- Database migration workflow documented.
- Backup/restore instructions for Neon or PostgreSQL.

### Performance

- Avoid unnecessary client-side cache for item open; fetch fresh.
- Use list virtualization if large task lists become slow.
- Keep cards lightweight.
- Optimize route loading.
- Avoid blocking UI during server communication.

## Acceptance Checklist

- Unauthorized mutation attempts fail server-side.
- Wrong role cannot update another department.
- Inactive user cannot log in.
- Audit logs cannot be edited or deleted through app UI.
- App still works if Pusher disconnects.
- Sentry receives test error in preview/prod.
- Health endpoint reports DB connectivity.

## Test Requirements

- Unit: all role permission matrix checks.
- Unit: CSRF/session validation behavior.
- Integration: unauthorized direct API call blocked.
- Integration: inactive user login blocked.
- Integration: audit log cannot be modified by app route.
- E2E: Pusher unavailable fallback still allows manual refresh.

---

# PHASE 12 — Public Demo and Final Deployment

## Goal

Ship production app and public demo without compromising real data.

## Build Scope

### Public Demo `/demo`

Rules:

- Public route.
- No login.
- Hardcoded mock data.
- Zero database connection.
- Read-only.
- Simulated realtime via client-side timer.
- State is pure function of current time modulo 24 hours.
- Auto-resets every 24 hours.

### Deployment

- Vercel project configured per client.
- Neon production database configured.
- Pusher production app configured.
- Sentry production project configured.
- Environment variables set.
- Prisma migration applied.
- Seed production workspace carefully.
- Domain connected.
- Health endpoint checked.

### Final QA

Run full path:

```txt
Superadmin config → Admin creates client/user/PO → Drafter → Purchasing → Production → QC → Delivery → Finance → Dashboard → PDF Export
```

Run failure path:

```txt
Wrong PIN → Redraw → Problem → Production before Purchasing complete → QC Minor → QC Major → Return → Finance hidden until redelivery
```

## Acceptance Checklist

- Production URL works.
- Demo route uses no database.
- No real client data appears in demo.
- Full happy path passes.
- Full failure path passes.
- Role guards pass.
- Mobile Android layout passes.
- Desktop manager dashboard passes.
- No monetary values exist.
- No upload UI exists.
- No external client access exists.

## Test Requirements

- E2E full happy path.
- E2E failure/rework/return path.
- E2E demo route has no auth and no mutation.
- E2E role denial matrix.
- Manual QA on actual Android phone.

---

# 4. AI Agent Work Rules

Every coding agent must follow these rules.

## 4.1 Before Coding

Read these files in order:

1. `POgrid_PRD_Factorized_synced.md`
2. `POgrid_TECH_STACK_SYNCED.md`
3. `POgrid_SHADCN_UI_UX_SYSTEM_SYNCED.md`
4. `ROADMAP.md`
5. current phase notes or issue prompt

Then state:

- what phase you are working on,
- what files you expect to touch,
- what product rules must not change,
- what tests you will run.

## 4.2 During Coding

- Keep changes small.
- Do not refactor unrelated files.
- Do not invent new product logic.
- Do not add new libraries without explicit approval.
- Do not bypass server-side validation because UI already validates.
- Do not emit realtime before DB commit.
- Do not write audit log outside the same transaction as the mutation.
- Do not place business logic only inside React components.

## 4.3 After Coding

Report:

- what was changed,
- what was not changed,
- what tests passed,
- what still needs manual verification,
- any PRD ambiguity found.

If blocked, report the exact blocker and stop. Do not improvise business rules.

---

# 5. Phase Dependency Map

```txt
Phase 0  → required for all
Phase 1  → required before any protected page
Phase 2  → required before real POgrid value exists
Phase 3  → requires Phase 2 PO + item + progress base
Phase 4  → requires Phase 2 production completion
Phase 5  → requires Phase 4 QC pass
Phase 6  → requires Phase 5 DONE items
Phase 7  → can start after Phase 2, but final integration depends on Phase 3–6
Phase 8  → can start after notifications exist, but final targeting depends on Phase 3–7
Phase 9  → requires dwell timestamps, DONE, rework, finance states
Phase 10 → can partially start after Phase 1, but department config affects Phase 2+
Phase 11 → runs continuously, final hardening after Phase 10
Phase 12 → final deploy after Phase 11
```

Recommended practical order:

```txt
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12
```

Do not skip Phase 2. Without Admin PO creation + Operator progress + Board sync, POgrid is not yet POgrid.

---

# 6. Definition of MVP

MVP is not “login and pretty cards.”

MVP means:

```txt
Admin creates PO → items enter workflow → operators update progress → all roles see current status → QC gates quality → Delivery marks DONE → Finance tracks invoice state → dashboard shows bottleneck/status truth
```

Minimum MVP phases:

```txt
Phase 0 through Phase 9
```

Deployable internal pilot:

```txt
Phase 0 through Phase 11
```

Public demo + client-ready release:

```txt
Phase 0 through Phase 12
```

---

# 7. Non-Negotiable Final QA Checklist

Before calling POgrid finished:

- Login is department/role → user → PIN pad.
- Superadmin is hidden under `/superadmin`.
- Staff sessions persist until logout.
- User can change own PIN from Profile.
- Admin can manage users and clients.
- Admin can create PO with multiple items and departments.
- Operators see full context but update only their own stage.
- Progress cannot decrease.
- 5-second undo creates no server write if cancelled.
- Realtime fires only after confirmed commit.
- Audit log exists for every significant mutation.
- Problems never block production.
- QC pass/minor/major logic works.
- Rework lineage is permanent.
- Return lineage works and does not mutate DONE original.
- Finance sees only DONE invoiceable items.
- Finance stores no money.
- Dashboard metrics are accurate.
- Board is visible to all roles.
- Notifications are in-app only.
- No upload UI exists.
- No external client route exists except public demo.
- Public demo has zero database connection.
- Mobile Android layout is usable with 44px touch targets.
- Bahasa Indonesia UI copy is used.
- Vercel production deployment works.
- Neon production DB is isolated per client.

---

# 8. Known Pending Design Decisions

These are the only allowed open decisions from the PRD:

1. Admin override progress — exact UI placement.
2. Client settings UI — detailed design.

Until decided:

- Do not remove Admin override capability.
- Do not expose Admin override casually on operator screens.
- Prefer Admin-only drawer from PO Detail item row.
- Keep Client settings minimal and consistent with Admin Settings tab.

---

# 9. Agent Prompt Template Per Phase

Use this prompt when starting any phase:

```txt
You are the implementation agent for POgrid.

Read these files first:
1. POgrid_PRD_Factorized_synced.md
2. POgrid_TECH_STACK_SYNCED.md
3. POgrid_SHADCN_UI_UX_SYSTEM_SYNCED.md
4. ROADMAP.md

Work only on Phase [NUMBER]: [PHASE NAME].

Do not change product logic.
Do not add new libraries unless explicitly required by the locked tech stack.
Use npm only.
Use Next.js App Router, TypeScript, Prisma, PostgreSQL, shadcn/ui, Tailwind, Sonner, Pusher where relevant.
UI copy must be Bahasa Indonesia.
Mobile-first implementation is required.
All operational mutations must validate permission server-side, write audit logs, and trigger realtime only after commit.

Before coding, summarize:
- files you will touch,
- data model assumptions,
- permission rules,
- UI components you will use,
- tests you will run.

Then implement the smallest complete vertical slice for this phase.
After coding, report changed files, tests run, and remaining manual QA.
```

---

# End of ROADMAP.md
