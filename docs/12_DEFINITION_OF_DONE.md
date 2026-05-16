# POgrid — Definition of Done

> A task, phase, or agent output is not done until it satisfies this checklist.

## Product Integrity

- PRD logic is preserved.
- No workflow rule is changed silently.
- No new product scope is added without instruction.
- No monetary values are added.
- No file upload or attachment feature is added.
- No external client access is added.
- No ERP, accounting, BOM, MRP, barcode, IoT, AI forecasting, or Gantt feature is added.
- Items remain assigned to departments, not individual users.
- All roles can view item context according to PRD.
- Roles can only act according to permissions.

## Technical Integrity

- Uses npm only.
- No pnpm or yarn commands in docs, scripts, or prompts.
- TypeScript passes.
- Lint passes.
- Build passes.
- Tests pass where tests exist.
- Prisma schema matches database contract.
- Server-side validation exists for mutations.
- Server-side authorization exists for mutations.
- PostgreSQL remains source of truth.
- Pusher is event broadcast only.
- Sonner is local toast only.
- TanStack Query is used for server data cache/invalidation.

Required commands:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

## Security Integrity

- PINs are hashed.
- PINs are never stored plaintext.
- Staff PIN is 4 digits.
- Superadmin PIN is 6 digits.
- Sessions are protected.
- Unauthorized routes are blocked.
- Unauthorized actions are blocked server-side.
- Superadmin is hidden from public login.
- Secrets are not exposed to browser.
- Error messages do not leak internals.
- AuditLog is append-only.

## UI/UX Integrity

- Mobile-first layout implemented.
- Touch targets are at least 44px.
- Bahasa Indonesia UI copy is used.
- shadcn/ui primitives are used where appropriate.
- Bottom navigation appears for authenticated factory staff.
- Notification bell appears on authenticated pages.
- Profile route exists for all authenticated factory staff.
- Login uses Department/Role icon → user list → PIN pad.
- No staff username/password login exists.
- Main item card/detail drawer pattern is shared.
- Drawer/sheet pattern is used for mobile confirmations.
- Loading, empty, and error states exist.

## Workflow Integrity

### PO

- Admin can create PO.
- PO creation validates required fields.
- Items are immediately visible on Board.
- Relevant operators receive notifications.
- No money/upload fields exist.

### Progress

- Operator can update own department only.
- Other department progress is read-only.
- Progress cannot go backward.
- Fresh server value is used when opening item.
- 5-second undo happens before server commit.
- Undo prevents database write, audit log, and Pusher broadcast.
- Commit writes AuditLog.
- Commit emits Pusher event.
- Other open views refresh.

### Drafting

- Approve Drawing advances to Purchasing.
- Request Redraw increments revision and creates problem.
- No Drafter user means Drafting bypasses to Purchasing.

### Purchasing

- Milestones are 33%, 66%, 100%.
- Cannot go backward.
- Purchasing is non-blocking.
- Production-before-purchasing-complete creates system problem.
- System problem auto-resolves when Purchasing reaches 100%.

### QC

- QC requires explicit gate decision.
- All Pass advances to Delivery.
- Minor defect stays in QC and marks rework.
- Major defect spawns child item.
- Rework badge never clears.
- Audit logs and notifications are created.

### Delivery

- Delivery confirmation sets DONE.
- DONE is terminal.
- Finance is notified.
- Client return creates child item.
- Original DONE item is not modified.

### Finance

- Finance works at item level.
- States: PENDING → INVOICED → PAID.
- PAID → INVOICED correction allowed.
- No monetary values shown or stored.
- Return items hidden until re-delivered.

### Problems

- Problems never block production.
- Operators can report problems.
- Authorized users can resolve problems.
- Resolution writes AuditLog.

## Realtime Integrity

- Pusher event emitted after successful database commit.
- Payload contains IDs/metadata only.
- Full business objects are not broadcast.
- Query invalidation rules are followed.
- Open item drawer refetches fresh data after relevant event.
- Notification count updates after notification creation.
- Reconnect refetches visible critical queries.

## Audit Integrity

Required audit logs are written for:

- Progress update
- Stage advance
- Admin override
- QC pass
- QC minor fail
- QC major fail
- Rework spawned
- Return spawned
- Invoice update
- PO field edit
- Flag escalation
- PO deletion
- Problem resolved
- PIN reset
- Self PIN change
- User created
- User toggled

## Documentation Integrity

- Any changed behavior is reflected in relevant `.md` files.
- Agent prompts do not contradict PRD.
- Commands use npm.
- Phase notes include manual verification steps.
- Open questions remain explicitly marked, not guessed.

## Final Acceptance

A feature is accepted only when:

1. It matches PRD behavior.
2. It passes build checks.
3. It passes role/permission checks.
4. It works on mobile layout.
5. It writes required database records.
6. It emits required realtime events.
7. It creates required notifications.
8. It writes required audit logs.
9. It has clear loading, empty, and error states.
10. It does not add forbidden scope.
