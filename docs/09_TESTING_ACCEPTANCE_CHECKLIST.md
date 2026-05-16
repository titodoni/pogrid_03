# POgrid — Testing Acceptance Checklist

> Use this file to decide if agent work is actually done. Passing build is not enough.

## Global Acceptance Rules

Every phase must satisfy:

- Uses npm, not pnpm or yarn.
- TypeScript passes.
- Lint passes.
- Build passes.
- No PRD logic changed.
- No monetary fields or UI added.
- No upload/attachment feature added.
- No external client portal added.
- Mobile layout checked first.
- 44px touch targets respected.
- Bahasa Indonesia UI copy used on production screens.
- Unauthorized roles cannot access restricted routes.
- Server validates permissions, not only UI.

Recommended commands:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

## Auth Tests

### Staff Login

- `/login` shows Department/Role icons.
- Superadmin does not appear on public login.
- Tapping a role opens active users.
- Inactive users are hidden.
- Tapping user opens numeric PIN pad.
- Correct 4-digit PIN logs in.
- Wrong PIN shakes and shows error.
- Wrong PIN triggers cooldown.
- No username/password text login exists.

### Superadmin

- `/superadmin` is accessible only through direct route.
- Superadmin uses 6-digit PIN.
- Superadmin is not in staff login.

### Redirects

- ADMIN → `/pos`
- OWNER/MANAGER/SALES → `/dashboard`
- FINANCE → `/finance`
- DRAFTER/PURCHASING/OPERATOR/QC/DELIVERY → `/tasks`

### Profile

- All authenticated factory users can open `/profile`.
- User can change own PIN without old PIN.
- PIN change writes AuditLog `SELF_PIN_CHANGE`.
- Logout works.

## Route Access Tests

- Admin can access `/pos`, `/po`, `/pos/new`, `/settings`, `/problems`.
- Owner/Manager/Sales can access `/dashboard` and `/board`.
- Finance can access `/finance` and `/board` but not `/dashboard`.
- Operators can access `/tasks` and `/board` but not Admin settings.
- All authenticated roles can access `/pos/[id]` read context.
- Public users cannot access authenticated pages.

## Navigation Tests

- Bottom navigation appears after login.
- Bottom navigation items match role.
- Notification bell appears on authenticated pages.
- No worker is sent to a task page without navigation.

## PO Creation Tests

- Admin can open `/pos/new`.
- Customer is searchable dropdown.
- Add New Customer opens bottom sheet.
- New customer auto-selects after creation.
- PO date defaults to today.
- Delivery deadline is optional.
- Urgent toggle exists.
- Vendor Job toggle exists.
- Item name required.
- Quantity required and uses numeric stepper.
- Unit defaults to pcs.
- Production departments are multi-select.
- Required fields show red border on submit attempt.
- No auto-scroll to first error.
- No monetary fields exist.
- No upload fields exist.
- Successful creation redirects to PO detail.
- Items appear on Board.
- Relevant operators receive notifications.

## Task List Tests

- `/tasks` shows relevant role tasks.
- Search can find global items.
- Items outside user's department are visible but read-only.
- Active tab shows Drafting through Delivery items.
- Archive tab shows DONE items from operator department.
- Archive can filter by month.
- Active filters: Delayed, Due Soon, In Progress.
- Sort order: overdue, upcoming deadline, urgent flag, rework.

## Item Card / Drawer Tests

- ItemTaskCard shows urgency border.
- Shows item name.
- Shows rework/return badge when applicable.
- Shows client name.
- Shows quantity.
- Shows department chip.
- Shows progress snapshot across departments.
- Shows last activity.
- Tapping card opens ItemDetailDrawer.
- Drawer fetches fresh item data.
- Drawer shows all department progress.
- Drawer shows role-specific action panel.
- Drawer is shared across Tasks, Board, PO detail, Finance if used.

## Production Progress Tests

- Operator can update own department only.
- Other departments are read-only.
- Progress cannot go backward.
- Slider minimum equals saved server value.
- qty = 1 uses 0–100 slider.
- qty > 1 uses completed quantity stepper.
- Quick-add buttons work: +5, +10, +20, All.
- Sonner shows 5-second Undo.
- Undo within 5 seconds prevents database write.
- No AuditLog is created if undone.
- No Pusher event fires if undone.
- If not undone, server commits after window.
- AuditLog `PROGRESS_UPDATE` created.
- Pusher `ITEM_PROGRESS_UPDATED` emitted.
- Other open task cards/drawers refetch.
- When all production departments reach 100%, item advances to QC.

## Drafting Tests

- Drafter sees Approve Drawing and Request Redraw.
- Approve advances item to Purchasing.
- Request Redraw increments revision count.
- Request Redraw keeps item in Drafting.
- Request Redraw creates problem.
- Admin + Manager notified.
- If no DRAFTER users exist, Drafting auto-advances to Purchasing on PO creation.

## Purchasing Tests

- Purchasing sees three milestone checkboxes.
- Order placed sets 33%.
- Vendor confirmed sets 66%.
- Material arrived sets 100%.
- Cannot go backward.
- Production can start before Purchasing 100%.
- Starting production before Purchasing 100% creates system problem.
- System problem auto-resolves when Purchasing reaches 100%.

## QC Tests

- QC sees Pass qty / Minor defect qty / Major defect qty.
- Sum must equal item quantity before submission.
- All Pass advances item to Delivery.
- Minor defect keeps item in QC.
- Minor defect resets QC progress to 0.
- Minor defect marks item rework permanently.
- Major defect spawns child item.
- Partial major fail updates original passing quantity and advances it to Delivery.
- Total major fail keeps original from advancing and spawns child for full quantity.
- Rework reason required.
- Other requires note.
- Audit logs are written.
- Notifications are sent.

## Delivery Tests

- Delivery can confirm shipped quantity.
- On confirmation, item becomes DONE.
- DONE is terminal.
- Finance receives notification.
- Delivery can trigger client return.
- Return never modifies original DONE item.
- Return creates child item with RETURN badge.
- Return child re-enters Production.

## Finance Tests

- Finance dashboard shows Pending, Invoiced, Paid counts.
- Search covers item name, client name, PO number.
- Client filter works.
- Pending tab allows Mark Invoiced.
- Invoiced tab allows Mark Paid.
- Paid tab allows Reverse to Invoiced.
- Every action requires bottom-sheet confirmation.
- Every status change writes AuditLog `INVOICE_UPDATE`.
- Return item hidden while in re-production.
- Return item appears when DONE again.
- No monetary value appears anywhere.

## Problem Tests

- Operators can report problem.
- QC can report problem.
- Delivery can report problem.
- Admin can report problem.
- Problem never blocks production.
- Other category requires note.
- Reporter can resolve own problem.
- Same-stage operator can resolve current-stage problem.
- Admin/Manager can resolve any problem.
- Problem resolution writes AuditLog `PROBLEM_RESOLVED`.

## Notification Tests

- Notifications are database records.
- Notification bell unread count updates.
- Notification drawer lists notifications.
- Tapping notification opens relevant PO/item when applicable.
- Workflow notifications are in-app only.
- No email, push, Telegram, or WhatsApp workflow notification exists.

## Realtime Sync Tests

Open two browser windows with different users.

- Progress update in one window updates other visible cards after commit.
- Open item drawer refetches after Pusher event.
- Board updates after item stage advance.
- Finance updates after item DONE.
- Notification count updates after notification creation.
- No realtime event fires during 5-second undo window.
- Reconnect refetches visible critical queries.

## Admin Delete PO Tests

- Delete blocked if any item DONE.
- Delete blocked if any item PAID.
- Block reason displayed.
- Eligible delete shows consequences.
- Admin must enter own PIN.
- Wrong PIN shakes, no deletion.
- Correct PIN deletes PO and redirects to PO list.
- AuditLog `DELETE_PO` written.

## Dashboard Tests

- Access: ADMIN, OWNER, MANAGER, SALES.
- Finance cannot access analytics.
- Period filters: 1M, 3M, 6M, 12M.
- Default is 3M.
- KPI cards render.
- On-Time vs Late chart renders.
- Bottleneck by Department chart renders.
- Rework Reasons donut renders.
- Sticky summary bar appears when KPI cards scroll out.

## PDF Export Tests

- Available only to ADMIN, OWNER, MANAGER, SALES.
- Generated server-side.
- Every page includes watermark with user name and date/time.

## Public Demo Tests

- `/demo` requires no login.
- Uses hardcoded mock data.
- Uses zero database connection.
- Read-only.
- Simulates realtime client-side.
- Auto-resets based on current time modulo 24 hours.
