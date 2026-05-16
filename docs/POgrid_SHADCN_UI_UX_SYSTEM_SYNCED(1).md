# POgrid — shadcn/ui UX System (Synced)

> Purpose: translate the synced POgrid PRD into a practical shadcn/ui-based design system for AI agent implementation.
> Scope: UI/UX rules only. No business logic changes. No implementation code.
> Product UI language: Bahasa Indonesia.

---

## 1. Design System Position

POgrid uses **shadcn/ui as the component foundation**, not as a visual theme copied blindly.

The product is an internal factory-floor app. The UI must prioritize:

1. speed of reading status,
2. tap-first interaction,
3. low typing,
4. mobile-first layout,
5. high contrast,
6. visible sync state,
7. role-based action clarity,
8. one shared item/task interaction model across pages.

shadcn/ui provides the primitives. POgrid defines the factory-specific patterns.

---

## 2. Core shadcn/ui Dependencies

Use these as the base component layer:

| Need | shadcn/ui Component |
|---|---|
| Buttons | `Button` |
| Cards | `Card`, `CardHeader`, `CardContent`, `CardFooter` |
| Forms | `Form`, `Input`, `Textarea`, `Label` |
| Selection | `Select`, `Command`, `Popover`, `Checkbox`, `RadioGroup` |
| Tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| Dialogs | `Dialog`, `AlertDialog` |
| Bottom sheets / mobile action panels | `Drawer` |
| Side panels | `Sheet` |
| Toasts | `Sonner` |
| Badges | `Badge` |
| Tables | `Table` only for desktop/admin views |
| Menus | `DropdownMenu` |
| Navigation | Custom wrapper using shadcn primitives + Lucide icons |
| Skeletons | `Skeleton` |
| Charts | `Recharts` inside shadcn-styled cards |
| Calendar/date picker | `Calendar` + `Popover` |

Do not introduce a second UI library. No MUI, Ant Design, DaisyUI, Chakra, Bootstrap, or Flowbite.

---

## 3. Visual Identity Tokens

### Brand Tokens

| Token | Value | Usage |
|---|---:|---|
| `--brand-primary` | `#14B8A6` | Main action, active navigation, completed/progress accent |
| `--brand-orange` | `#F59E0B` | Warning, rework, attention |
| `--brand-red` | `#EF4444` | Error, urgent, failed action |
| `--brand-blood-red` | `#991B1B` | Past due / critical overdue |
| `--brand-dark` | `#111827` | Text, toast background, strong contrast |
| `--brand-muted` | `#6B7280` | Secondary text |
| `--brand-border` | `#E5E7EB` | Card border, dividers |
| `--brand-bg` | `#F3F4F6` | App canvas |
| `--brand-surface` | `#FFFFFF` | Cards, drawers, panels |

Use the POgrid logo reference: dark background, rounded 3x3 grid icon with teal, orange, and red blocks, wordmark `POgrid.id`, tagline `MONITOR CONTROL DELIVER`.

### shadcn Theme Mapping

| shadcn Token | POgrid Meaning |
|---|---|
| `background` | App background |
| `foreground` | Main text |
| `card` | PO cards, item cards, KPI cards |
| `card-foreground` | Text on cards |
| `primary` | Teal brand action |
| `primary-foreground` | White text on primary |
| `secondary` | Muted surface / low-priority action |
| `muted` | Disabled or quiet background |
| `muted-foreground` | Timestamp, metadata, helper text |
| `destructive` | Red / failed / delete |
| `border` | Neutral divider |
| `ring` | Focus ring |

Do not use arbitrary colors directly in feature components. Use semantic wrappers: urgency, stage, status, sync state, role.

---

## 4. Typography

Use default shadcn typography behavior with POgrid constraints.

| Element | Rule |
|---|---|
| App font | Inter or system sans |
| PO number | Monospace style allowed for alignment |
| KPI value | Large, bold, numeric-first |
| Card title | Semibold, high contrast |
| Metadata | Smaller, muted, never below 11px |
| Error text | Bahasa Indonesia, clear, action-oriented |

Minimum practical text size:

- normal content: 13px minimum,
- metadata: 11px minimum,
- button labels: 13px minimum,
- KPI numbers: 24px or larger.

No English UI copy except technical system labels that are explicitly part of product identity.

---

## 5. Layout System

### Mobile First

POgrid must be designed from mobile upward.

| Breakpoint | Layout Rule |
|---|---|
| `<640px` | Single column, bottom nav, full-width cards, drawers for actions |
| `640–1024px` | Two-column cards where useful, larger drawers/sheets |
| `>1024px` | Wider dashboard grids, optional side nav, tables allowed for admin-heavy views |

### Page Shell

Every authenticated page uses the same shell:

1. top app bar,
2. notification bell,
3. page title/context,
4. scrollable content area,
5. bottom navigation on mobile,
6. safe-area padding for phone screens.

### Mobile Bottom Navigation

Bottom navigation is required for authenticated staff pages.

Role-based navigation items:

| Role | Bottom Nav |
|---|---|
| ADMIN | `PO`, `Board`, `Problem`, `Profil` |
| OWNER / MANAGER / SALES | `Dashboard`, `Board`, `Notif`, `Profil` |
| DRAFTER / PURCHASING / OPERATOR / QC / DELIVERY | `Tugas`, `Board`, `Masalah`, `Profil` |
| FINANCE | `Finance`, `Board`, `Notif`, `Profil` |

Rules:

- Height: minimum 56px.
- Touch target: minimum 44px.
- Active item uses primary teal.
- Inactive item uses muted foreground.
- Icon + short Bahasa label.
- Do not show Superadmin in normal navigation.

---

## 6. Global Components

### 6.1 App Top Bar

Use a custom POgrid component built from shadcn primitives.

Contains:

- current page title,
- optional role badge,
- notification bell,
- sync state indicator when relevant,
- optional quick action button.

Mobile: compact, one row.
Desktop: can include breadcrumbs and actions.

### 6.2 Notification Bell

Use:

- `Button` variant ghost,
- Lucide `Bell`,
- unread count as `Badge`,
- opens `Sheet` or `Drawer` depending on viewport.

Behavior:

- newest first,
- unread visually distinct,
- tap notification navigates to related PO/item,
- mark read on tap or explicit action,
- in-app only.

### 6.3 Bottom Drawer Pattern

Use shadcn `Drawer` for mobile-first actions.

Drawer is preferred for:

- progress update panel,
- QC verdict,
- delivery confirmation,
- finance confirmation,
- report problem,
- delete PO confirmation,
- edit PO fields,
- reset PIN,
- add user,
- add client inline.

Drawer rules:

- top radius: large / rounded-2xl,
- visible drag handle,
- primary action sticky at bottom when form is long,
- destructive actions require explicit confirmation,
- do not nest multiple drawers if avoidable.

### 6.4 Sheet Pattern

Use shadcn `Sheet` mainly on tablet/desktop for:

- notification panel,
- activity log,
- item detail side panel,
- filters,
- admin edit panels.

Mobile should prefer `Drawer`, not side sheet.

### 6.5 Toast Pattern

Use Sonner.

Toast types:

| Situation | Toast |
|---|---|
| Progress pending cancel window | Persistent toast with countdown + `Batal` |
| Success | Short toast |
| Failed save | Persistent toast + `Coba lagi` |
| PIN wrong | Inline error + shake, not just toast |
| Delete success | Success toast + redirect |

Progress save rule:

- show optimistic UI immediately,
- show 5-second undo toast,
- do not write to server until countdown expires,
- broadcast realtime only after commit.

---

## 7. POgrid Domain Components

These are custom components composed from shadcn primitives.

### 7.1 `POCard`

Base: `Card`.

Must show:

- left urgency border,
- internal PO number,
- client name,
- delivery deadline,
- PO status,
- item count summary,
- problem count if any,
- progress snapshot.

Interaction:

- tap opens PO detail,
- admin may access edit actions through menu,
- no monetary data.

### 7.2 `ItemTaskCard`

This is the core POgrid card.

Must be reused across:

- `/tasks`,
- `/board`,
- `/pos/[id]`,
- `/finance` where item invoice state is shown,
- dashboard drilldowns.

The card shows full item context for all roles:

- item name,
- PO number,
- client,
- quantity,
- current stage,
- urgency border,
- rework/return lineage pill,
- all department progress snapshot,
- own role action state,
- last activity,
- sync state.

Role rule:

- every role can see global item context,
- only the permitted role can act on its own stage/task,
- read-only states must be visually obvious.

### 7.3 `ItemDetailDrawer`

One shared detail/action drawer for item operations.

Tabs or sections:

1. `Ringkasan`,
2. `Progress`,
3. `Masalah`,
4. `Aktivitas`,
5. role-specific action panel.

Do not create separate unrelated modals for each role. Use one shared item detail pattern with role-specific panels.

### 7.4 `StageProgressStrip`

Displays full production context.

Stages:

`Drafting → Purchasing → Production → QC → Delivery → Done`

Production stage may include multiple configured departments in parallel.

State styles:

| State | Visual |
|---|---|
| Done | Filled teal/green |
| Active | Filled/outlined with pulse or ring |
| Waiting | Muted outline |
| Problem | Warning/error badge attached |
| Locked | Muted lock icon if not actionable |

Never rely on color alone. Add icon or label.

### 7.5 `DepartmentProgressList`

Shows each department progress row.

Each row:

- department name,
- percentage or quantity completed,
- status badge,
- last updated metadata.

For operator:

- own department row has action controls,
- other department rows are read-only.

### 7.6 `QuantityStepper`

Use for `qty > 1`.

Controls:

- decrement disabled if below saved server value,
- increment by `+1`, `+5`, `+10`, `+20`, `Semua`,
- display `Selesai: n / total pcs`,
- large tap targets.

No direct typing unless admin override context requires precision.

### 7.7 `PercentSlider`

Use for `qty = 1`.

Rules:

- 0–100,
- cannot go below saved server value,
- show current percentage as large number,
- commit through 5-second undo flow.

### 7.8 `ProblemBadge`

Use `Badge`.

States:

- open problem: warning/destructive depending severity,
- resolved problem: muted,
- system problem: label `Sistem`,
- multiple problems: count badge.

Problems never block production, so do not use blocking modal styles.

### 7.9 `LineagePill`

Use `Badge` variant custom.

Types:

| Type | Label | Color Intent |
|---|---|---|
| Rework | `↩ RW dari [item]` | Orange |
| Return | `↩ RETURN dari [item]` | Red |

Badge is permanent and visible in every item card/detail view.

### 7.10 `UrgencyBorder`

All PO and item cards use left border urgency accent.

Priority:

`BLOOD_RED → RED → ORANGE → NORMAL`

Use label + icon in addition to color:

- Normal: `Normal`,
- Orange: `Segera`,
- Red: `Mendesak`,
- Blood Red: `Terlambat`.

---

## 8. Role-Specific UI Patterns

### 8.1 Login UI

No typing-first login.

Flow:

1. department/role icon grid,
2. user list panel,
3. numeric PIN pad,
4. wrong PIN shake + cooldown,
5. correct PIN redirects by role.

Use:

- `Card` for department tiles,
- `Drawer` for user list on mobile,
- custom numeric keypad using `Button`,
- no normal text input for factory staff PIN.

Superadmin:

- hidden `/superadmin`,
- 6-digit PIN pad,
- not shown on public login grid.

### 8.2 Admin UI

Admin uses more CRUD-heavy screens, but still mobile-first.

Use:

- cards over tables on mobile,
- tables only on desktop where density helps,
- drawers for create/edit forms,
- alert dialogs for destructive actions,
- PIN re-confirmation drawer for PO deletion.

Admin pages:

- `/pos`,
- `/po`,
- `/pos/new`,
- `/pos/[id]`,
- `/problems`,
- `/settings`,
- `/settings/users`,
- `/settings/clients`,
- `/settings/flags`.

### 8.3 Operator UI

Operator UX must be tap-first.

Use:

- task cards,
- drawer action panels,
- steppers/sliders,
- chips for filters,
- no dense tables,
- always show sync status.

Primary operator route: `/tasks`.

### 8.4 Drafter UI

Actions:

- `Setujui Gambar`,
- `Minta Revisi`.

`Minta Revisi` requires confirmation and optional/required note depending problem category rule.

### 8.5 Purchasing UI

Use milestone checklist cards.

Milestones:

1. `Pesanan dibuat` = 33%,
2. `Vendor konfirmasi` = 66%,
3. `Material tiba` = 100%.

Cannot go backward.

### 8.6 QC UI

Use quantity split drawer.

Fields:

- pass quantity,
- minor defect quantity,
- major defect quantity,
- reason selector if any fail,
- note for `Other`.

Validation:

- total must equal item quantity,
- show inline error,
- final action requires confirmation.

### 8.7 Delivery UI

Actions:

- confirm shipped quantity,
- mark item DONE,
- trigger client return from delivered item context.

Use confirmation drawer before final submit.

### 8.8 Finance UI

Finance works at item level.

Use:

- summary cards,
- tabs: `Pending`, `Tertagih`, `Lunas`,
- searchable client filter,
- item cards with invoice state,
- confirmation drawer for every state change.

No money values, no invoice amount input, no upload.

---

## 9. Page-Level shadcn Mapping

| Route | Layout | Main shadcn Components |
|---|---|---|
| `/login` | Step-based mobile flow | `Card`, `Button`, `Drawer` |
| `/dashboard` | KPI + charts | `Card`, `Tabs`, `Select`, `Badge`, Recharts |
| `/pos` | Admin home cards/list | `Card`, `Badge`, `Button`, `DropdownMenu` |
| `/po` | PO list filters | `Tabs`, `Card`, `Badge`, `Command`, `Popover` |
| `/pos/new` | PO creation flow | `Form`, `Card`, `Drawer`, `Command`, `Checkbox`, `Button` |
| `/pos/[id]` | Detail + item cards | `Card`, `Tabs`, `Drawer`, `Sheet`, `Badge` |
| `/tasks` | Operator task list | `Card`, `Tabs`, `Badge`, `Drawer`, `Button` |
| `/board` | Global floor view | `Card`, `Tabs`, `Badge`, `Sheet`, `Command` |
| `/problems` | Open problem list | `Card`, `Badge`, `Select`, `Drawer`, `Button` |
| `/finance` | Invoice state board | `Card`, `Tabs`, `Command`, `Select`, `Drawer` |
| `/settings` | Admin settings hub | `Tabs`, `Card`, `Form`, `Switch`, `AlertDialog` |
| `/profile` | User self-service | `Card`, `Button`, PIN keypad/drawer |
| `/superadmin` | Hidden config | `Card`, `Form`, `Tabs`, `AlertDialog` |
| `/demo` | Public simulation | `Card`, `Badge`, `Tabs`, mock realtime indicator |

---

## 10. Form Rules

POgrid forms must be short, explicit, and tap-friendly.

Rules:

- Use `React Hook Form` + `Zod`.
- Use shadcn `Form` wrappers.
- Required fields show red border after submit attempt.
- No auto-scroll to first error.
- Use searchable dropdown for client.
- Use bottom sheet for inline add client.
- Use checkboxes/chips for department multi-select.
- Use steppers for quantity.
- Avoid free typing where selection works.

PO creation form sections:

1. PO header,
2. customer,
3. deadline/urgency,
4. notes,
5. item list,
6. item departments,
7. final review.

---

## 11. Status, Badge, and Color Semantics

### Item Status Badges

| Status | Bahasa Label | Intent |
|---|---|---|
| Drafting | `Gambar` | Info |
| Purchasing | `Purchasing` | Purple/info |
| Production | `Produksi` | Teal |
| QC | `QC` | Warning |
| Delivery | `Delivery` | Blue/info |
| Done | `Selesai` | Success |

### Finance Badges

| State | Bahasa Label | Intent |
|---|---|---|
| Pending | `Belum Ditagih` | Warning |
| Invoiced | `Tertagih` | Info |
| Paid | `Lunas` | Success |

### Sync Badges

| State | Label | Visual |
|---|---|---|
| Local pending | `Menunggu` | Spinner / muted |
| Undo window | `Bisa dibatalkan` | Countdown |
| Saved | `Tersimpan` | Check |
| Failed | `Gagal` | Red + retry |
| Offline | `Offline` | Warning |

---

## 12. Empty, Loading, Error, and Offline States

### Loading

Use `Skeleton` for:

- page load,
- card list load,
- chart load,
- notification drawer load.

Do not skeleton block already-known cached UI during operator action.

### Empty State

Use simple card:

- clear title,
- short explanation,
- one action if relevant.

Examples:

- `Tidak ada tugas aktif`,
- `Belum ada PO`,
- `Tidak ada masalah terbuka`,
- `Belum ada item finance di tab ini`.

### Error State

Use inline error banner or toast depending scope.

- field error: inline,
- action error: toast with retry,
- page fetch error: card with retry button,
- permission error: clear read-only message.

### Offline / Realtime Disconnected

Show persistent but non-blocking indicator.

Operator must still understand whether an action is:

- locally pending,
- committed,
- failed,
- retryable.

---

## 13. Accessibility Rules

Hard rules:

- touch target minimum 44px,
- contrast WCAG AA,
- no color-only status,
- focus states visible,
- all icon-only buttons require accessible label,
- drawers/dialogs must trap focus,
- destructive actions require confirmation,
- font scaling must not break core task cards,
- charts must have text summaries.

Factory-floor readability beats visual elegance.

---

## 14. Animation and Motion

Allowed:

- subtle fade for realtime updates,
- 80–150ms press feedback,
- shake animation for wrong PIN,
- small pulse for active stage,
- drawer open/close default motion.

Not allowed:

- aggressive dashboard animations,
- decorative motion that slows task completion,
- motion that hides status change,
- animated loaders longer than necessary.

Animated loader may use POgrid logo style, but it must not delay app interaction artificially.

---

## 15. Dashboard UX

Dashboard access:

- ADMIN,
- OWNER,
- MANAGER,
- SALES.

Finance cannot access analytics.

Use:

- `Card` for KPI cards,
- `Tabs` or segmented control for period filter,
- `Select` if period options grow,
- Recharts for charts,
- sticky summary bar on scroll.

KPI cards:

1. Total POs,
2. On-Time %,
3. Avg Lead Time,
4. Total Overdue Items,
5. Total Rework Items,
6. Stalled Items.

Chart cards:

- On-Time vs Late,
- Bottleneck by Department,
- Rework Reasons.

Mobile rule:

- KPI cards can be 2-column if readable,
- charts full width,
- sticky summary bar must not cover bottom navigation.

---

## 16. Security-Sensitive UI

### PIN Inputs

- numeric keypad,
- no visible plain PIN after entry,
- show dots,
- wrong PIN shake + cooldown,
- no detailed auth failure reason.

### Admin Delete PO

Use `AlertDialog` or `Drawer` confirmation with PIN re-confirmation.

Must show:

- whether deletion is blocked,
- reason if blocked,
- affected item count if allowed,
- PIN confirmation,
- destructive red final button.

### Admin Override

Open design decision resolved for UI system:

Admin override should appear inside `ItemDetailDrawer` under a clearly separated section:

`Admin Override`

Rules:

- collapsed by default,
- warning text shown,
- requires confirmation,
- logs `ADMIN_OVERRIDE`,
- never looks like normal operator progress.

This preserves the PRD logic while giving the AI agent a concrete UI location.

---

## 17. Component Naming Convention

Use product-domain component names, not generic vague names.

Good:

- `ItemTaskCard`,
- `ItemDetailDrawer`,
- `ProgressCommitToast`,
- `StageProgressStrip`,
- `DepartmentProgressList`,
- `UrgencyBadge`,
- `LineagePill`,
- `FinanceStatusTabs`,
- `NotificationDrawer`,
- `RoleBottomNav`.

Bad:

- `CustomCard`,
- `MainModal`,
- `BoxThing`,
- `DataPanel`,
- `CommonView`.

---

## 18. AI Agent Implementation Guardrails

When asking an AI coding agent to implement UI:

1. Use shadcn/ui primitives only.
2. Build custom POgrid domain components on top of shadcn.
3. Mobile-first first, desktop second.
4. All UI text in Bahasa Indonesia.
5. Do not add monetary fields.
6. Do not add file upload.
7. Do not add external client portal.
8. Do not add per-user item assignment.
9. Do not change PRD workflow logic.
10. Keep the shared `ItemTaskCard` / `ItemDetailDrawer` pattern across flows.
11. Show all department status context, but only allow permitted actions.
12. Every mutation must show sync state.
13. Every destructive action must confirm.
14. Every role must have Profile access.
15. Superadmin stays hidden at `/superadmin`.

---

## 19. Recommended First shadcn Install Set

Install only the components needed for Phase 0–1 first:

```txt
button
card
badge
drawer
sheet
dialog
alert-dialog
tabs
input
label
form
select
checkbox
popover
command
skeleton
dropdown-menu
sonner
separator
textarea
calendar
```

Add chart/table components only when dashboard and admin density require them.

---

## 20. Final UI Principle

POgrid is not a pretty admin dashboard.

POgrid is a factory-floor status machine.

Every screen must answer:

1. What is this?
2. Where is it now?
3. Is it late?
4. Is there a problem?
5. What can this role do next?
6. Did my update save?

If a design element does not support one of those questions, remove it.
