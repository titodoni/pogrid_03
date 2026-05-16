# POgrid — Database Schema Contract

> This is a logical schema contract for Prisma/PostgreSQL. It defines entities, relationships, required fields, and forbidden fields. It is not implementation code.

## Schema Principles

- PostgreSQL is the source of truth.
- Prisma models must reflect PRD business logic, not generic SaaS assumptions.
- Use explicit relations and foreign keys.
- Use enums only where values are fixed by the product.
- AuditLog is append-only.
- Notification is persistent in-app state.
- Pusher events are not persisted as business truth.
- No monetary fields anywhere.
- No upload or attachment fields anywhere.

## Workspace

Represents one factory deployment.

Required fields:

- `id`
- `name`
- `logoUrl` optional branding reference only, not upload storage
- `primaryColor`
- `adminWhatsAppNumber` for Forgot PIN deep link only
- `poNumberTemplate`
- `orangeThresholdDays` default 7
- `redThresholdDays` default 3
- `billingStatus`
- `createdAt`
- `updatedAt`

Relationships:

- Has many Departments
- Has many Users
- Has many Clients
- Has many ProductionOrders
- Has many Notifications
- Has many AuditLogs

Forbidden:

- No multi-tenant cross-workspace queries.
- No cross-client shared data.

## Department

Configured by Superadmin. Active departments become production stages and create matching operator role keys.

Required fields:

- `id`
- `workspaceId`
- `name`
- `roleKey` generated from department name, e.g. `OPERATOR_MACHINING`
- `stageOrder`
- `isActive`
- `createdAt`
- `updatedAt`

Relationships:

- Belongs to Workspace
- Has many Users through role assignment or department role
- Has many ItemProgress records

Rules:

- Departments are used for production assignment.
- Items are assigned to departments, never individual users.
- Dynamic operator roles stay synced with active production departments.

## User

Factory staff or Superadmin.

Required fields:

- `id`
- `workspaceId` nullable only for platform-level Superadmin if implemented outside workspace
- `name`
- `roleKey`
- `pinHash`
- `isActive`
- `lastLoginAt` optional
- `createdAt`
- `updatedAt`

Role keys:

- `SUPERADMIN`
- `ADMIN`
- `OWNER`
- `MANAGER`
- `SALES`
- `QC`
- `DELIVERY`
- `FINANCE`
- `DRAFTER`
- `PURCHASING`
- `OPERATOR_{DEPARTMENT_NAME}`

Rules:

- Staff PIN is 4 digits before hashing.
- Superadmin PIN is 6 digits before hashing.
- PIN must never be stored as plaintext.
- Inactive users cannot log in.

## Session

Represents explicit logged-in state.

Required fields:

- `id`
- `userId`
- `workspaceId`
- `sessionTokenHash`
- `createdAt`
- `lastSeenAt`

Rules:

- Sessions do not expire automatically.
- Logout explicitly deletes or invalidates the session.
- No remote session invalidation unless later explicitly added.

## Client

Factory customer record.

Required fields:

- `id`
- `workspaceId`
- `name`
- `contact` optional
- `isActive`
- `createdAt`
- `updatedAt`

Relationships:

- Has many ProductionOrders

Forbidden:

- No external client login.
- No client portal fields.

## ProductionOrder

Represents one PO.

Required fields:

- `id`
- `workspaceId`
- `clientId`
- `internalPoNumber`
- `clientPoNumber` optional
- `poDate`
- `dueDate` optional
- `notes` optional
- `manualUrgencyLevel` optional, admin escalation only
- `isVendorJob`
- `createdByUserId`
- `createdAt`
- `updatedAt`
- `deletedAt` optional only if soft delete is chosen

Computed status:

- `ACTIVE`
- `FINISHED`
- `CLOSED`

Relationships:

- Belongs to Workspace
- Belongs to Client
- Has many Items
- Has many AuditLogs via metadata/reference

Rules:

- Internal PO number is auto-generated but editable.
- PO status is computed from item states and invoice states.
- Do not store computed flag level unless a technical cache is explicitly justified.

## Item

Represents a production item inside a PO.

Required fields:

- `id`
- `workspaceId`
- `productionOrderId`
- `parentItemId` optional for rework/return lineage
- `name`
- `specification` optional
- `quantity`
- `unit` default `pcs`
- `status`
- `source` enum: `ORIGINAL`, `REWORK`, `RETURN`
- `reworkType` optional enum: `MINOR`, `MAJOR`
- `reworkReason` optional
- `isRework`
- `isReturn`
- `drawingRevisionCount`
- `drawingApprovedAt` optional
- `qcPassedAt` optional
- `deliveredAt` optional
- `invoiceStatus`
- `draftingStartedAt` optional
- `purchasingStartedAt` optional
- `productionStartedAt` optional
- `qcStartedAt` optional
- `deliveryStartedAt` optional
- `doneAt` optional
- `createdAt`
- `updatedAt`

Item status values:

- `DRAFTING`
- `PURCHASING`
- `PRODUCTION`
- `QC`
- `DELIVERY`
- `DONE`

Invoice status values:

- `PENDING`
- `INVOICED`
- `PAID`

Relationships:

- Belongs to ProductionOrder
- Has many ItemProgress records
- Has many Problems
- Has many child Items through `parentItemId`

Rules:

- DONE is terminal.
- Original DONE item is never modified when a client return happens.
- Return creates a child item.
- QC major fail creates a child item.
- Rework badge is permanent.
- Return badge is permanent for return child.

## ItemProgress

One record per Item × Department.

Required fields:

- `id`
- `workspaceId`
- `itemId`
- `departmentId`
- `progressValue` 0–100
- `completedQuantity` optional for qty > 1
- `startedAt` optional
- `completedAt` optional
- `lastUpdatedByUserId` optional
- `lastUpdatedAt` optional
- `createdAt`
- `updatedAt`

Unique constraint:

- `(itemId, departmentId)` must be unique.

Rules:

- Progress cannot decrease through normal operator update.
- For qty = 1, use percentage slider.
- For qty > 1, use completed quantity stepper and derive progress.
- Department counters work in parallel in Production.
- Item advances to QC only when all assigned department progress values are 100.

## Problem

Represents reported or system-generated issue.

Required fields:

- `id`
- `workspaceId`
- `itemId`
- `category`
- `note` optional unless category is Other
- `reportedByUserId` nullable for system
- `reporterType` enum: `USER`, `SYSTEM`
- `isResolved`
- `resolvedByUserId` optional
- `resolutionNote` optional
- `resolvedAt` optional
- `createdAt`
- `updatedAt`

Categories:

- `MATERIAL_NOT_ARRIVED`
- `MATERIAL_MISMATCH`
- `MACHINE_TOOL_FAILURE`
- `OPERATOR_UNAVAILABLE`
- `DRAWING_SPEC_UNCLEAR`
- `OTHER`
- System-specific categories may be added only when mapped to PRD anomalies.

Rules:

- Problems never block production.
- System problems auto-resolve when trigger condition clears.

## Notification

Persistent in-app notification.

Required fields:

- `id`
- `workspaceId`
- `targetUserId` optional
- `targetRoleKey` optional
- `type`
- `title`
- `body`
- `poId` optional
- `itemId` optional
- `problemId` optional
- `readAt` optional
- `createdAt`

Rules:

- Must be in-app only.
- No email, push, WhatsApp, Telegram workflow notification.
- WhatsApp is only for Forgot PIN deep link.

## AuditLog

Append-only history.

Required fields:

- `id`
- `workspaceId`
- `actorUserId` nullable for system
- `actorType` enum: `USER`, `SYSTEM`
- `action`
- `entityType`
- `entityId`
- `fromValue` JSON optional
- `toValue` JSON optional
- `metadata` JSON optional
- `createdAt`

Required actions:

- `PROGRESS_UPDATE`
- `STAGE_ADVANCE`
- `ADMIN_OVERRIDE`
- `QC_PASS`
- `QC_MINOR_FAIL`
- `QC_MAJOR_FAIL`
- `REWORK_SPAWNED`
- `RETURN_SPAWNED`
- `INVOICE_UPDATE`
- `EDIT_PO_FIELD`
- `FLAG_ESCALATE`
- `DELETE_PO`
- `PROBLEM_RESOLVED`
- `PIN_RESET`
- `SELF_PIN_CHANGE`
- `USER_CREATED`
- `USER_TOGGLED`

Rules:

- Never delete audit logs.
- Never edit audit logs.
- Admin overrides must be logged as `ADMIN_OVERRIDE`.

## Forbidden Fields Anywhere

- `price`
- `amount`
- `cost`
- `subtotal`
- `total`
- `tax`
- `discount`
- `paymentAmount`
- `invoiceAmount`
- `attachmentUrl`
- `fileUrl`
- `uploadId`
- `clientPortalUserId`
