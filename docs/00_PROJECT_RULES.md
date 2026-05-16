# POgrid — Project Rules

> Read this file first before any coding. These rules override agent preference, framework habit, and generic SaaS assumptions.

## Non-Negotiable Product Rules

- POgrid is an internal production tracking app for fabrication factories.
- POgrid is not an ERP.
- POgrid is not accounting software.
- POgrid must never store or show monetary values.
- POgrid must never include file uploads or attachments.
- POgrid must never expose client/customer login access.
- POgrid must never assign production items to individual workers.
- Items are assigned to departments only.
- All staff can view item context across departments, but can only act according to role permissions.
- DONE is terminal and irreversible.
- Rework and return items are represented through child-item lineage, not mutation of completed history.

## Technical Rules

- Use npm only. Do not use pnpm or yarn.
- Use Next.js App Router.
- Use TypeScript.
- Use Prisma for database access.
- Use PostgreSQL as the source of truth.
- Use Neon PostgreSQL for hosted deployment.
- Use Vercel for deployment.
- Use Pusher for realtime event broadcast only.
- Use TanStack Query for client cache, refetch, and invalidation.
- Use Sonner for temporary local toast feedback only.
- Use shadcn/ui primitives for UI.
- Use Tailwind CSS for styling.
- Use Zod for validation contracts.
- Use React Hook Form for form handling.

## UI Rules

- UI text must be Bahasa Indonesia unless explicitly stated otherwise.
- Build mobile-first before desktop.
- Touch targets must be at least 44px.
- Factory workers must not be forced to type when a tap-first flow is possible.
- Login must use Department/Role icon → user selection → PIN pad.
- Do not build username/password text login for staff.
- Superadmin must not appear on the public login screen.
- Superadmin login is only available at `/superadmin`.
- Primary authenticated navigation uses bottom navigation on mobile.
- All authenticated users must have access to Profile/Pengaturan Profil and Logout.

## Architecture Rules

- Business logic belongs on the server, not inside React components.
- UI components must not own business truth.
- React components display state and trigger mutations only.
- Every significant mutation must pass through a server-side mutation gate.
- Every required mutation must create AuditLog rows.
- Every required notification must create Notification rows.
- Pusher broadcasts after the database commit, not before.
- Pusher payloads must contain IDs and metadata only, not full business objects.
- Clients refetch or invalidate affected queries after Pusher events.
- PostgreSQL remains the final source of truth.

## Progress Sync Rules

- Progress can only move forward.
- Progress cannot decrease except through specific PRD-approved flows such as QC minor rework reset.
- Fresh item data must be fetched when opening an item detail drawer.
- Concurrent progress updates use last-write-wins at the server.
- 5-second undo happens before server commit.
- If undo is tapped within 5 seconds, there is no database write, no audit log, and no Pusher broadcast.
- If the 5-second window expires, the server commits the mutation, writes audit log, creates notifications if needed, then broadcasts realtime events.

## Forbidden Agent Behavior

- Do not add payment amount, price, cost, invoice value, tax, discount, or balance fields.
- Do not add upload, attachment, image, PDF attachment, or document storage features.
- Do not add external customer portal features.
- Do not add AI forecasting, BOM, MRP, IoT, barcode, or Gantt features.
- Do not change PRD business logic unless explicitly instructed.
- Do not rename departments or stages away from the approved terminology.
- Do not silently introduce English UI copy for production screens.
- Do not create duplicate component patterns when shared components already exist.
- Do not bypass audit logs for convenience.
- Do not use local-only state as the source of truth for production workflow.

## Approved Core Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm test
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```
