# POgrid — Business Logic Contract

> All workflow mutations must follow this contract. Business rules belong server-side. UI components may trigger mutations but must not implement workflow truth.

## Universal Mutation Rules

Every server mutation must enforce:

- Current session exists.
- User is active.
- User role is allowed.
- Workspace boundary is respected.
- Input is validated with Zod or equivalent server validation.
- Database transaction is used when multiple writes must stay consistent.
- AuditLog is written when required.
- Notification rows are created when required.
- Pusher event is emitted only after successful commit.
- Returned response contains enough IDs for client invalidation.

## `createPO()`

Allowed roles:

- ADMIN only.

Inputs:

- Client ID or inline-created client data
- Internal PO number
- Client PO number optional
- PO date
- Delivery deadline optional
- Notes optional
- Urgent toggle
- Vendor Job toggle
- One or more items
- For each item: name, specification optional, quantity, unit, production department IDs

Validation:

- Customer required.
- At least one item required.
- Item name required.
- Quantity must be positive.
- Each item must have at least one production department.
- No monetary fields accepted.
- No attachment fields accepted.

Database writes:

- ProductionOrder
- Items
- ItemProgress records for assigned departments
- Stage timestamps according to initial status
- Notifications for relevant operators
- AuditLog entries as needed

Workflow:

- If DRAFTER users exist, item starts in DRAFTING.
- If no DRAFTER users exist, item auto-advances to PURCHASING.
- Items must immediately appear on Board.

Pusher events:

- `PO_CREATED`
- `NOTIFICATION_CREATED` when notifications are inserted

Forbidden:

- Do not assign item to an individual user.
- Do not create invoice amount.
- Do not upload files.

## `approveDrawing()`

Allowed roles:

- DRAFTER
- ADMIN override

Validation:

- Item must be in DRAFTING unless ADMIN override path is explicit.

Database writes:

- Set drawing approved timestamp.
- Advance item to PURCHASING.
- Set `purchasingStartedAt` if first entry.
- Create AuditLog `STAGE_ADVANCE`.
- Create notifications for Purchasing role.

Pusher events:

- `ITEM_STAGE_ADVANCED`
- `NOTIFICATION_CREATED`

## `requestRedraw()`

Allowed roles:

- DRAFTER
- ADMIN override

Inputs:

- Reason note optional but recommended.

Database writes:

- Increment drawing revision count.
- Item remains in DRAFTING.
- Create system Problem.
- Notify ADMIN and MANAGER.
- AuditLog records redraw/problem creation.

Pusher events:

- `PROBLEM_REPORTED`
- `NOTIFICATION_CREATED`

Forbidden:

- Do not advance stage.

## `updatePurchasingMilestone()`

Allowed roles:

- PURCHASING
- ADMIN override

Milestones:

- Order placed = 33%
- Vendor confirmed = 66%
- Material arrived = 100%

Validation:

- Cannot go backward.
- Milestone sequence must be forward only.

Database writes:

- Update purchasing progress.
- Write AuditLog `PROGRESS_UPDATE`.
- If material arrived and system problem exists for production-before-purchasing-complete, auto-resolve it.

Pusher events:

- `ITEM_PROGRESS_UPDATED`
- `PROBLEM_RESOLVED` if applicable

Workflow:

- Purchasing is non-blocking.
- Item can enter Production before Purchasing reaches 100%, but system must create a problem for this anomaly.

## `updateProductionProgress()`

Allowed roles:

- Matching `OPERATOR_{DEPARTMENT}` for own department
- ADMIN override

Inputs:

- Item ID
- Department ID
- New progress value or completed quantity

Validation:

- Item must be relevant to the department.
- Normal operator can update own department only.
- Progress cannot decrease.
- Slider minimum is saved server value.
- For qty > 1, completed quantity cannot exceed item quantity.
- Fresh server value must be checked before commit.

Undo rule:

- 5-second undo happens client-side before calling this mutation.
- If mutation is called, it means undo window has expired.

Database writes:

- Update ItemProgress.
- Set started/completed timestamps as needed.
- Write AuditLog `PROGRESS_UPDATE`.
- If all assigned production departments are 100%, advance item to QC.
- Write AuditLog `STAGE_ADVANCE` if advanced.
- Notify QC when item enters QC.

Pusher events:

- `ITEM_PROGRESS_UPDATED`
- `ITEM_STAGE_ADVANCED` if advanced
- `NOTIFICATION_CREATED` if notification inserted

Forbidden:

- Do not broadcast before commit.
- Do not store local-only progress as truth.

## `advanceToQCIfReady()`

Allowed callers:

- Server-side only, called from progress mutation or admin override.

Condition:

- All assigned production department ItemProgress values are 100.

Database writes:

- Set item status to QC.
- Set `qcStartedAt` if first entry.
- Write AuditLog `STAGE_ADVANCE`.
- Notify QC role.

Pusher events:

- `ITEM_STAGE_ADVANCED`
- `NOTIFICATION_CREATED`

Forbidden:

- No manual UI-only stage change.

## `submitQCDecision()`

Allowed roles:

- QC
- ADMIN override

Inputs:

- Pass quantity
- Minor defect quantity
- Major defect quantity
- Rework reason if defect exists
- Other note if reason is Other

Validation:

- Item must be in QC.
- Pass + Minor + Major must equal item quantity.
- Reason required for defect.
- Other requires free-text note.

Path A — All Pass:

Database writes:

- Advance item to DELIVERY.
- Set QC pass timestamp.
- Set `deliveryStartedAt` if first entry.
- AuditLog `QC_PASS` and `STAGE_ADVANCE`.
- Notify Delivery role.

Pusher events:

- `ITEM_QC_PASSED`
- `ITEM_STAGE_ADVANCED`
- `NOTIFICATION_CREATED`

Path B — Minor Defect:

Database writes:

- Item stays in QC.
- QC progress resets to 0.
- Item permanently marked as rework.
- Rework type = MINOR.
- Problem may be created if needed.
- Notify ADMIN and MANAGER.
- AuditLog `QC_MINOR_FAIL`.

Pusher events:

- `ITEM_QC_FAILED`
- `NOTIFICATION_CREATED`

Path C — Major Defect:

Database writes:

- Spawn child item with source REWORK.
- Child quantity = failing quantity.
- Child status = PRODUCTION.
- Child production progress reset to 0.
- Child has parentItemId.
- Child marked rework permanently.
- Original item advances with passing quantity when partial pass exists.
- If total fail, original item does not advance.
- AuditLog `QC_MAJOR_FAIL`.
- AuditLog `REWORK_SPAWNED`.
- Notify ADMIN and MANAGER.

Pusher events:

- `ITEM_QC_FAILED`
- `ITEM_REWORK_SPAWNED`
- `NOTIFICATION_CREATED`

Forbidden:

- Do not clear rework badge after later pass.
- Do not mutate DONE item.

## `confirmDelivery()`

Allowed roles:

- DELIVERY
- ADMIN override

Inputs:

- Shipped quantity

Validation:

- Item must be in DELIVERY.
- Quantity must match required delivery behavior.

Database writes:

- Set item status DONE.
- Set delivered/done timestamp.
- Set invoice status PENDING.
- AuditLog `STAGE_ADVANCE`.
- Notify FINANCE, OWNER, MANAGER.

Pusher events:

- `ITEM_DELIVERED`
- `ITEM_STAGE_ADVANCED`
- `NOTIFICATION_CREATED`

Forbidden:

- DONE cannot be reversed.

## `spawnReturnItem()`

Allowed roles:

- DELIVERY
- ADMIN override

Inputs:

- Original DONE item ID
- Return quantity
- Reason/note

Validation:

- Original item must be DONE.
- Original DONE item must not be modified.

Database writes:

- Create child item with source RETURN.
- Child status = PRODUCTION.
- Child item progresses through PRODUCTION → QC → DELIVERY → DONE.
- Finance notified that original item is pending re-delivery.
- AuditLog `RETURN_SPAWNED`.

Pusher events:

- `ITEM_RETURN_SPAWNED`
- `NOTIFICATION_CREATED`

Finance rule:

- Return child is hidden from Finance tabs until it reaches DONE again.
- After re-delivery, it appears as Pending with RETURN badge.

## `markInvoiceStatus()`

Allowed roles:

- FINANCE
- ADMIN override

Allowed transitions:

- PENDING → INVOICED
- INVOICED → PAID
- PAID → INVOICED correction allowed

Validation:

- Item must be DONE.
- Return child must be DONE before invoiceable.
- No monetary fields accepted.

Database writes:

- Update item invoice status.
- AuditLog `INVOICE_UPDATE`.
- If PAID, notify OWNER and MANAGER.
- Recompute PO status as needed.

Pusher events:

- `INVOICE_STATUS_UPDATED`
- `NOTIFICATION_CREATED` if PAID notification inserted

## `reportProblem()`

Allowed roles:

- ADMIN
- OPERATOR
- QC
- DELIVERY

Inputs:

- Item ID
- Category
- Note optional, required for Other

Validation:

- Problem category must be valid.
- Other requires note.

Database writes:

- Create Problem.
- Notify OWNER, MANAGER, ADMIN.
- AuditLog if implemented for problem creation.

Pusher events:

- `PROBLEM_REPORTED`
- `NOTIFICATION_CREATED`

Rule:

- Problem never blocks production.

## `resolveProblem()`

Allowed roles:

- Reporter can resolve own problem.
- Same-stage operators can resolve problems on items in their current stage.
- ADMIN can resolve any problem.
- MANAGER can resolve any problem.

Inputs:

- Problem ID
- Optional resolution note

Database writes:

- Mark Problem resolved.
- Set resolver and resolved timestamp.
- AuditLog `PROBLEM_RESOLVED`.

Pusher events:

- `PROBLEM_RESOLVED`

## `deletePO()`

Allowed roles:

- ADMIN only.

Guard:

- Block deletion if any item is DONE.
- Block deletion if any item has PAID invoice status.
- If blocked, show reason.
- If eligible, require Admin PIN confirmation.

Validation:

- PIN must match current Admin.

Database writes:

- Delete PO and related non-terminal records according to chosen cascade strategy.
- AuditLog `DELETE_PO` must record consequence summary.

Pusher events:

- `PO_DELETED`

Forbidden:

- No deletion without PIN.
- No deletion of DONE/PAID history.

## `resetPIN()`

Allowed roles:

- ADMIN resetting factory staff PIN.
- Superadmin if managing workspace users.

Database writes:

- Generate memorable 4-digit PIN for staff.
- Store hashed PIN.
- Display new PIN once inline.
- AuditLog `PIN_RESET`.

Pusher events:

- Usually none unless notification pattern is explicitly needed.

Forbidden:

- Never store plaintext PIN.

## `changeOwnPIN()`

Allowed roles:

- Any authenticated user.

Validation:

- Staff PIN = 4 digits.
- Superadmin PIN = 6 digits.
- No old PIN required by PRD.

Database writes:

- Store hashed new PIN.
- AuditLog `SELF_PIN_CHANGE`.

UI feedback:

- Sonner toast confirms success.
