# POgrid Agent Context Summary

> Phase 00B output. This file summarizes implementation constraints for future agents. It does not change PRD logic and is not implementation code.

## Documents Read

- `docs/00_PROJECT_RULES.md`
- `docs/POgrid_PRD_Factorized_synced.md`
- `docs/POgrid_TECH_STACK_SYNCED.md`
- `docs/POgrid_SHADCN_UI_UX_SYSTEM_SYNCED.md`
- `docs/ROADMAP-2.md`
- `docs/01_DATABASE_SCHEMA_CONTRACT.md`
- `docs/02_BUSINESS_LOGIC_CONTRACT.md`
- `docs/03_REALTIME_EVENTS_CONTRACT.md`
- `docs/05_ROUTE_ACCESS_MATRIX.md`
- `docs/07_AUTH_AND_PIN_CONTRACT.md`
- `phases/00B_AGENT_CONTEXT_INTAKE.md`

Roadmap filename note:

- The roadmap exists as `docs/ROADMAP-2.md`, not `docs/POgrid_REVISED_ROADMAP_MASTER.md`.
- `docs/ROADMAP-2.md` has been aligned to the current npm-only rule.

## Immutable POgrid Rules

- POgrid is an internal production tracking app for fabrication factories.
- POgrid must answer production status, shipment readiness, production problems, invoice state, and bottleneck questions without asking another human.
- Product UI copy is Bahasa Indonesia only. The PRD and agent docs can be English.
- POgrid is not an ERP and not accounting software.
- No monetary values can exist anywhere.
- No file uploads or attachments can exist anywhere.
- No external client/customer portal or login can exist.
- Items are assigned to departments, never individual workers.
- All staff can view item context across departments, but mutations are role-limited.
- DONE is terminal and irreversible.
- Rework and return history is preserved through child-item lineage, not mutation of completed history.
- Problems never block production.
- Audit logs are append-only and cannot be edited from the UI.
- Public demo must use mock data only and never connect to production data.

## Tech Stack Rules

- Package manager for this repo is npm only. Do not use pnpm or yarn.
- Framework is Next.js App Router with TypeScript.
- This repo uses a Next.js version with changed behavior; read relevant local docs in `node_modules/next/dist/docs/` before Next-specific code changes.
- PostgreSQL is the source of truth.
- Prisma owns schema, migrations, typed queries, transaction boundaries, and relational access.
- Hosted database target is Neon PostgreSQL, one isolated database per client deployment.
- Deployment target is Vercel, one deployment per factory client.
- Realtime provider is Pusher, broadcast-only after confirmed commits.
- UI foundation is Tailwind CSS plus shadcn/ui primitives.
- Icons use Lucide React.
- Temporary local feedback uses Sonner only.
- Forms use React Hook Form and Zod.
- Analytics should be computed server-side from PostgreSQL/Prisma data, not from client cached lists.
- Testing stack should cover pure logic with Vitest, UI with React Testing Library, and critical flows with Playwright.

## Auth Rules

- Staff login route is `/login`.
- Superadmin route is `/superadmin` only and must never appear in public login UI or staff navigation.
- Staff login flow is Department/Role icon, active user list, numeric PIN pad.
- Staff login must not use username/password, email login, OAuth, magic links, or OTP.
- Staff PINs are 4-digit numeric values before hashing.
- Superadmin PINs are 6-digit numeric values before hashing.
- PINs are stored hashed only and never logged or persisted in plaintext.
- Staff sessions never expire automatically. Logout is explicit.
- No remote session invalidation exists in the current PRD.
- Forgot PIN opens a WhatsApp deep link to the Admin number only. WhatsApp is not a workflow notification channel.
- Admin user creation and PIN reset display generated staff PINs once, then store only the hash.
- Own PIN change is available from `/profile`; old PIN is not required by the PRD.
- Wrong PIN attempts require shake/error/cooldown UI and server-side rate limiting.
- Every protected mutation must validate session, active user, role, workspace boundary, and item/stage permission.

## Route Access Rules

- Unauthenticated users go to `/login`, except `/demo` and `/superadmin`.
- Authenticated staff visiting `/login` should redirect to their role home.
- Unauthorized route access redirects to the user's role home.
- Bottom navigation appears on authenticated factory staff pages only.
- `/profile` is available to all authenticated factory staff.
- `/settings` is Admin workspace settings, not personal profile.
- Role home routes:
  - ADMIN: `/pos`
  - OWNER, MANAGER, SALES: `/dashboard`
  - FINANCE: `/finance`
  - DRAFTER, PURCHASING, OPERATOR_*, QC, DELIVERY: `/tasks`
  - SUPERADMIN: `/superadmin`
- Route access:
  - `/dashboard`: ADMIN, OWNER, MANAGER, SALES
  - `/pos`, `/po`, `/pos/new`, `/problems`, `/settings`, `/settings/users`, `/settings/clients`, `/settings/flags`: ADMIN
  - `/pos/[id]`, `/board`, `/profile`: all authenticated factory roles
  - `/tasks`: DRAFTER, PURCHASING, OPERATOR_*, QC, DELIVERY, with ADMIN optional
  - `/finance`: FINANCE
  - `/demo`: public mock-only
  - `/superadmin`: SUPERADMIN only

## Realtime Rules

- PostgreSQL remains the source of truth. Pusher is not persistence.
- Server commits database transaction first.
- AuditLog and Notification rows are created before realtime broadcast when required.
- Pusher broadcasts only after successful commit.
- Pusher payloads contain IDs and metadata only, never full PO, item, user, notification, or audit-log objects.
- Clients use events to invalidate/refetch visible data.
- Pusher must not store notification state.
- Sonner must not be used as realtime infrastructure.
- The 5-second progress undo window is client-side and pre-commit. If undone, there is no server write, audit log, notification, or Pusher event.
- On Pusher reconnect, clients should refetch critical visible queries, notification count, and any open item drawer.

## Database Source-of-Truth Rules

- PostgreSQL is final truth for workspace, departments, users, sessions, clients, POs, items, item progress, problems, notifications, and audit logs.
- Prisma schema must reflect PRD business rules, not generic SaaS assumptions.
- Use explicit relations and foreign keys.
- AuditLog is append-only.
- Notification is persistent in-app state.
- Item status pipeline is `DRAFTING -> PURCHASING -> PRODUCTION -> QC -> DELIVERY -> DONE`.
- Each stage entry timestamp is the source for dwell-time analytics.
- ItemProgress is one record per Item and Department, unique on `(itemId, departmentId)`.
- Progress cannot decrease in normal operator flows.
- For quantity 1, progress uses a percentage value.
- For quantity greater than 1, progress uses completed quantity and derives progress.
- Item advances to QC only when all assigned production department progress values are 100.
- Finance works at item level with only `PENDING`, `INVOICED`, and `PAID`.
- PO status is computed from item status and invoice status.
- Urgency flag is computed dynamically from due date and thresholds, with optional admin manual escalation upward only.
- All operational mutations requiring multiple writes must use a transaction:
  - validate permission
  - validate current state
  - validate quantity/progress invariant
  - write domain mutation
  - write audit log
  - write notification if required
  - commit
  - trigger realtime event after commit

## Forbidden Features

- No price, amount, cost, subtotal, total, tax, discount, payment amount, invoice amount, or balance fields.
- No upload, attachment, file URL, upload ID, document storage, or image/PDF attachment features.
- No external client portal or client login.
- No ERP, accounting, BOM, MRP, Gantt, per-stage deadline, AI forecasting, IoT, barcode, email notification, push notification, Telegram notification, or WhatsApp workflow notification.
- No individual worker assignment for production items.
- No username/password, email, OAuth, magic-link, or OTP login for staff.
- No plain text PIN storage.
- No UI-only authorization.
- No local state as production workflow truth.
- No realtime event before database commit.
- No duplicate item-detail/task-card patterns when a shared component should serve all routes.

## Current Implementation Context

- Phase 00A found local PostgreSQL reachable and database `pogrid_03` present, but Prisma database connectivity was blocked by `.env` pointing at unreachable `localhost:51214` and missing `DIRECT_URL`.
- Prisma is initialized with `prisma/schema.prisma` and `prisma.config.ts`.
- No business schema has been created.
- No POgrid business UI has been created.
- Future implementation should not proceed to Phase 01A until environment variables point Prisma to the intended local database and Phase 00A is clean.
