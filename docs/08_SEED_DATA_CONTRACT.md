# POgrid — Seed Data Contract

> Seed data must make the app testable from day one. It should cover every role, every major workflow branch, and every important visual state.

## Rules

- Seed must use npm/npx commands.
- Seed must not contain monetary values.
- Seed must not create uploads or attachments.
- Seed must be deterministic enough for agents to test reliably.
- Seed should be safe to reset in local development.
- Seed should demonstrate workflow, not fake ERP scope.

## Required Seed Command

```bash
npx prisma db seed
```

Optional local reset command:

```bash
npx prisma migrate reset
```

## Workspace

Create one workspace:

- Name: `POgrid Demo Factory`
- Primary color: POgrid teal or configured brand color
- Admin WhatsApp number: placeholder local/dev number
- PO number template: `PO-{YYYY}-{SEQ}`
- Orange threshold: 7 days
- Red threshold: 3 days
- Billing status: active

## Departments

Create active departments:

1. Drafting
2. Purchasing
3. Machining
4. Fabrikasi
5. QC
6. Delivery
7. Finance

Notes:

- Machining and Fabrikasi are production departments.
- QC, Delivery, and Finance are static roles, not dynamic production operator departments.
- If implementing Department table for all operational areas, clearly distinguish production departments from static stage roles.

## Users

Create one active user for each role.

| Name | Role | PIN |
|---|---|---|
| Admin Demo | ADMIN | 2468 |
| Owner Demo | OWNER | 2468 |
| Manager Demo | MANAGER | 2468 |
| Sales Demo | SALES | 2468 |
| Drafter Demo | DRAFTER | 2468 |
| Purchasing Demo | PURCHASING | 2468 |
| Machining Demo | OPERATOR_MACHINING | 2468 |
| Fabrikasi Demo | OPERATOR_FABRIKASI | 2468 |
| QC Demo | QC | 2468 |
| Delivery Demo | DELIVERY | 2468 |
| Finance Demo | FINANCE | 2468 |

Rules:

- Store PIN hashes only.
- Display seed PINs only in seed documentation/dev logs if needed.
- Do not expose seed PINs in production.

## Clients

Create at least three clients:

- PT Maju Jaya
- CV Sumber Teknik
- PT Lampung Metalworks

Fields:

- Name required
- Contact optional

## Production Orders

Create sample POs that cover visual states.

### PO 1 — Active Normal

Purpose:

- Basic active production.

Items:

- `Bracket Plate`, qty 10 pcs, departments: Machining + Fabrikasi
- `Bolt Custom`, qty 1 pcs, department: Machining

State:

- One item in Production
- Partial progress on Machining
- Fabrikasi not started

### PO 2 — Due Soon / Orange

Purpose:

- Urgency sort and flag.

Items:

- `Frame Support`, qty 5 pcs, departments: Fabrikasi

State:

- Due within orange threshold
- Purchasing at 66%

### PO 3 — Red / Near Deadline

Purpose:

- Red urgency.

Items:

- `Machine Cover`, qty 2 pcs, departments: Machining + Fabrikasi

State:

- Due within red threshold
- Production in progress

### PO 4 — Blood Red / Overdue

Purpose:

- Overdue sorting and dashboard.

Items:

- `Shaft Housing`, qty 3 pcs, departments: Machining

State:

- Past due date
- Stalled item with no progress in last 24 hours

### PO 5 — QC Queue

Purpose:

- QC workflow testing.

Items:

- `Welded Stand`, qty 4 pcs, departments: Fabrikasi

State:

- All production progress 100%
- Item status QC

### PO 6 — Delivery Queue

Purpose:

- Delivery confirmation testing.

Items:

- `Aluminum Rail`, qty 8 pcs, departments: Machining

State:

- QC passed
- Item status DELIVERY

### PO 7 — Finance Pending

Purpose:

- Finance pending item.

Items:

- `Mounting Base`, qty 6 pcs

State:

- DONE
- Invoice status PENDING

### PO 8 — Finance Invoiced/Paid

Purpose:

- Finance tabs.

Items:

- `Guard Plate`, qty 2 pcs, status DONE, invoice INVOICED
- `Spacer Ring`, qty 12 pcs, status DONE, invoice PAID

### PO 9 — Rework Sample

Purpose:

- Rework lineage and badge.

Items:

- Parent item: `Pulley Bracket`, qty 10 pcs
- Child item: `Pulley Bracket Rework`, qty 2 pcs, source REWORK, parentItemId set

State:

- Child in PRODUCTION
- Rework badge visible
- AuditLog contains `REWORK_SPAWNED`

### PO 10 — Return Sample

Purpose:

- Client return flow.

Items:

- Parent DONE item: `Door Frame`, qty 1 pcs
- Child return item: `Door Frame Return`, qty 1 pcs, source RETURN, parentItemId set

State:

- Return child in PRODUCTION or DONE depending desired finance test
- Return badge visible
- AuditLog contains `RETURN_SPAWNED`

## ItemProgress Samples

Seed must include:

- Not started: 0%
- In progress: 33%, 50%, 66%
- Completed: 100%
- Qty = 1 slider sample
- Qty > 1 quantity stepper sample
- Parallel production: Machining and Fabrikasi progress differ on same item

## Problems

Create open problems:

- Material not arrived
- Machine/tool failure
- Drawing/spec unclear
- Other with note

Create resolved problem:

- Material mismatch resolved by Manager/Admin

Create system problem:

- Production started before Purchasing complete
- Auto-resolvable when Purchasing reaches 100%

## Notifications

Seed unread and read notifications for:

- New PO created
- Item advanced to QC
- Problem reported
- Item marked rework
- Item DONE for Finance
- Finance marks PAID for Owner/Manager

## Audit Logs

Seed audit logs for:

- `PROGRESS_UPDATE`
- `STAGE_ADVANCE`
- `QC_PASS`
- `QC_MINOR_FAIL`
- `QC_MAJOR_FAIL`
- `REWORK_SPAWNED`
- `RETURN_SPAWNED`
- `INVOICE_UPDATE`
- `PROBLEM_RESOLVED`
- `PIN_RESET`
- `USER_CREATED`

## Acceptance Expectations

After seed, tester should be able to:

- Login as every role with PIN.
- See correct home route for every role.
- See Board as every authenticated role.
- See Tasks as operator/QC/Delivery/Drafter/Purchasing.
- Create new PO as Admin.
- Update progress as operator.
- Test 5-second undo.
- Submit QC pass/fail.
- Confirm delivery.
- See Finance pending item.
- Mark item invoiced/paid.
- See rework and return badges.
- See notifications and audit logs.
- See dashboard metrics with non-empty data.
