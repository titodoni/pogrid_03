# POgrid — UI Component Contract

> POgrid UI uses shadcn/ui primitives, mobile-first layout, and shared item components. Components must not own business truth.

## UI Principles

- Mobile-first.
- Touch-first.
- Bahasa Indonesia UI copy.
- 44px minimum touch targets.
- Drawer/bottom-sheet first for mobile actions.
- Avoid dense desktop tables on phone screens.
- Use shared components instead of route-specific duplicates.
- Business logic stays server-side.
- Component state is UI state only.

## Core Layout Components

### `AppShell`

Purpose:

- Authenticated page shell.

Used by:

- `/dashboard`
- `/pos`
- `/po`
- `/pos/new`
- `/pos/[id]`
- `/tasks`
- `/board`
- `/problems`
- `/finance`
- `/settings`
- `/profile`

Responsibilities:

- Render top bar.
- Render bottom navigation for authenticated factory users.
- Provide content safe area.
- Respect mobile viewport.

Must not:

- Implement role permission logic beyond rendering already-authorized navigation.
- Fetch business data unrelated to shell.

### `TopBar`

Purpose:

- Page title and global actions.

Contains:

- Page title
- Optional workspace name/logo
- NotificationBell
- Optional role chip

Must not:

- Own notification state directly; use notification query.

### `BottomNav`

Purpose:

- Role-based mobile navigation.

Inputs:

- Current role
- Current route

Rules:

- Items differ by role.
- Must include Profile for all authenticated factory staff.
- Must not show unauthorized pages.

### `NotificationBell`

Purpose:

- Shows unread notification count.
- Opens NotificationDrawer.

Data:

- Uses `['notificationCount', userId]`.

Must not:

- Use Sonner as notification storage.

### `NotificationDrawer`

Purpose:

- Persistent in-app notification list.

Data:

- Uses `['notifications', userId]`.

Behavior:

- Tap notification navigates to target item/PO when applicable.
- Read/unread state handled through server mutation.

## Item Display Components

### `ItemTaskCard`

Purpose:

- Shared compact item card for task list and board-like views.

Used by:

- `/tasks`
- `/board`
- `/pos/[id]` item list if appropriate

Displays:

- Urgency border
- Item name
- Rework/return badge
- Client name
- Quantity and unit
- Overdue/due-soon text
- Owning/current department chip
- Progress snapshot across departments
- Main progress bar
- Last activity

Interaction:

- Tap opens `ItemDetailDrawer`.

Must not:

- Own item truth.
- Run progress mutation directly unless through child action panel.
- Hide other departments' status from roles that are allowed to view all context.

### `ItemDetailDrawer`

Purpose:

- Main shared item modal/drawer synced across flows.

Used by:

- `/tasks`
- `/board`
- `/pos/[id]`
- `/finance` if item detail needed
- Notification deep links

Data:

- Fetches fresh `['item', itemId]` when opened.

Displays:

- Full item context
- PO number
- Client
- Quantity
- Current status
- Urgency
- Lineage pill
- Department progress rows
- Problems
- Activity summary
- RoleActionPanel

Must not:

- Own business state.
- Duplicate route-specific workflow logic.

### `ProgressSnapshot`

Purpose:

- Read-only status summary across all departments.

Displays:

- Department name
- Progress
- Status icon: Done / In Progress / Waiting / Problem

Used by:

- ItemTaskCard
- ItemDetailDrawer
- PO detail
- Board

### `DepartmentProgressRow`

Purpose:

- One department status row.

Displays:

- Department label
- Progress value
- Timestamp/last actor if available
- Problem indicator

Rules:

- Editable only if current user has permission through RoleActionPanel.
- Default is read-only.

### `UrgencyBorder`

Purpose:

- Visual left border accent for urgency.

Levels:

- NORMAL = green
- ORANGE
- RED
- BLOOD_RED

Rules:

- Sort priority follows urgency rules.
- Flag is computed dynamically from due date plus manual escalation.

### `LineagePill`

Purpose:

- Shows rework/return lineage.

Variants:

- Rework: orange pill — `↩ RW dari [parent item]`
- Return: red pill — `↩ RETURN dari [parent item]`

Rules:

- Badge never clears.
- References immediate parent.

### `ProblemBadge`

Purpose:

- Indicates item has open problem.

Behavior:

- Tap opens problem section or drawer.

## Action Components

### `RoleActionPanel`

Purpose:

- Renders role-specific actions inside ItemDetailDrawer.

Variants:

- Production Operator
- Drafter
- Purchasing
- QC
- Delivery
- Finance
- Admin override

Rules:

- Only show actions allowed by role.
- All other department data remains read-only.
- Calls server mutations only.
- Does not implement business rules locally.

### `QuantityProgressControl`

Purpose:

- Progress input for production.

Behavior:

- qty = 1: slider 0–100.
- qty > 1: quantity stepper `Selesai: n / total pcs`.
- Quick-add shortcuts: +5, +10, +20, All.

Rules:

- Minimum is current saved server value.
- Cannot go backward.
- Uses 5-second Sonner undo before server mutation.

### `NumericStepper`

Purpose:

- Generic quantity input.

Used by:

- PO creation item quantity
- Production quantity progress
- QC quantity split
- Delivery shipped quantity

Rules:

- Tap-first.
- Avoid text typing where possible.

### `PINPad`

Purpose:

- Numeric PIN entry.

Used by:

- Staff login
- Superadmin login
- Admin delete PO confirmation

Rules:

- Staff PIN = 4 digits.
- Superadmin PIN = 6 digits.
- Wrong PIN triggers shake.
- No username/password text login.

### `ConfirmSheet`

Purpose:

- Bottom-sheet confirmation for destructive or important actions.

Used by:

- Finance status changes
- Delete PO
- Resolve problem
- Delivery confirmation
- QC decision submission
- Client return trigger

Rules:

- Mobile bottom sheet.
- Clear consequence text.
- Primary/secondary actions.

### `ReportProblemSheet`

Purpose:

- Report a problem from item context.

Fields:

- Category
- Note

Rules:

- Other requires note.
- Problem never blocks production.

## Page-Level Components

### `POCreateForm`

Purpose:

- Admin creates PO.

Rules:

- Customer searchable dropdown.
- Add customer inline bottom sheet.
- Item repeatable section.
- Department multi-select from configured departments.
- Quantity numeric stepper.
- No monetary field.
- No upload field.

### `FinanceItemRow`

Purpose:

- Finance list item.

Displays:

- Item name
- Client
- PO number
- Invoice status
- RETURN badge if applicable

Actions:

- Pending → Mark Invoiced
- Invoiced → Mark Paid
- Paid → Reverse to Invoiced

Must not:

- Display money.

### `DashboardKpiCard`

Purpose:

- Analytics KPI card.

Used by:

- `/dashboard`
- Admin home where applicable

### `StickySummaryBar`

Purpose:

- Appears after KPI cards scroll out.

Displays:

- Active POs
- On-Time %
- Bottleneck department

## shadcn/ui Primitive Preference

Use:

- `Button`
- `Card`
- `Badge`
- `Tabs`
- `Sheet`
- `Drawer` when available/appropriate
- `Dialog` only for desktop or non-mobile-critical flows
- `Input`
- `Textarea`
- `Select` / `Command` for searchable dropdowns
- `Checkbox`
- `Switch`
- `Toast` via Sonner
- `Skeleton`
- `Alert`

Avoid:

- Custom modal systems unless shadcn cannot support the interaction.
- Desktop-only tables for primary mobile workflows.

## Copy Rules

UI labels should be Bahasa Indonesia.

Examples:

- `Tugas`
- `Board`
- `Masalah`
- `Finance`
- `Profil`
- `Simpan`
- `Batalkan`
- `Laporkan Masalah`
- `Ubah PIN`
- `Keluar`
- `Progress tersimpan ✓ — Batalkan?`

## Forbidden Component Behavior

- Do not create separate task-card designs per route.
- Do not create separate item modal designs per role.
- Do not embed Prisma/database calls inside components.
- Do not hardcode permissions in visual components without server validation.
- Do not show unauthorized buttons and rely only on server rejection.
- Do not add price, amount, upload, attachment, or customer portal UI.
