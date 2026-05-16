# POgrid — Factorized Product Requirements Document
> Single source of truth. No implementation code. Logic routes only.
> Optimized for AI agent brainstorming and collaborative design.
> Synchronized revision based on confirmed POgrid discussions. Core workflow logic preserved.

---

## CORE IDEA

**POgrid** is a lightweight, internal production tracking SaaS for small-to-medium fabrication factories (metalwork, CNC machining, welding, aluminum/iron fabrication, etc.).

**The single promise:** Any role — at any moment — can answer any status question about any Production Order without asking another human.

### The Five Questions POgrid Always Answers
1. Which stage is this Production Order at right now?
2. When will these items be ready for shipment?
3. What problems occurred during production?
4. Has this PO been invoiced yet?
5. Which production stage is causing the most delays?

### Product Language Rule
- This PRD is written in English for AI agent clarity.
- Product UI copy is Bahasa Indonesia only.
- No multi-language feature is planned.

### Hard Constraints (Non-Negotiable)
- No monetary values — ever. Not on POs, not on invoices, not anywhere.
- No file uploads or attachments.
- No external client access.
- Not an ERP. Not accounting software.
- No per-stage deadlines or Gantt charts.
- No AI forecasting, BOM, MRP, or IoT integration.
- In-app production/status notifications only — no WhatsApp, email, Telegram, or push for workflow events.
- WhatsApp is allowed only as an out-of-band Forgot PIN deep link to the Admin number. It is not a notification channel.

---

## DEPLOYMENT MODEL

- **Single-tenant:** One independent deployment per factory client.
- **Hosted per client:** One Vercel deployment/domain per factory workspace.
- **Database isolation:** One database per deployment/workspace. Cross-client queries must not exist.
- **Flat subscription:** Monthly per workspace. No usage tiers.
- **Complete isolation:** No cross-client data is architecturally possible.
- **Internal app, public domain:** The app is used only by factory staff, but it may be reachable from a public URL. Security must assume the URL can be discovered.

---

## SECURITY AND OPERATIONAL SCOPE

POgrid is an internal factory app exposed through a public domain. The app must be designed as if unauthorized users can discover the login URL.

### Security Rules
- All access decisions must be enforced server-side.
- UI hiding is not authorization.
- PINs are never stored in plain text.
- Superadmin uses a hidden `/superadmin` route and 6-digit PIN.
- Factory staff use the public `/login` route and 4-digit PIN.
- Login attempts must have cooldown/rate-limit protection.
- Every mutating action must verify session, role, and permission scope.
- Admin override must require explicit confirmation and always writes `ADMIN_OVERRIDE`.
- Dangerous actions such as reset, delete, and seed/wipe require PIN re-confirmation.
- Audit logs are append-only and must not be editable from the UI.
- Public demo must never connect to production data.

### Data Exposure Rules
- No external client access.
- No file uploads or attachments.
- No monetary values.
- No cross-workspace access.
- No production data in `/demo`.

---

## ACCESS HIERARCHY

### Layer 1 — Platform Owner (Superadmin)
The developer / platform owner. Hidden route, not linked from any UI.

**Responsibilities:**
- Workspace branding (name, logo, primary color)
- Configure production departments (name, order, active/inactive)
- Set PO number auto-generation template
- Set urgency flag escalation thresholds
- Set Admin's WhatsApp number (used only for Forgot PIN flow)
- Database seeding and reset (requires PIN re-confirmation)
- Billing and subscription status

### Layer 2 — Factory Staff
All employees of the factory client. Public login route.

---

## ROLES & PERMISSIONS

### Static Roles

| Role | Core Capability |
|------|----------------|
| **ADMIN** | Full CRUD on POs, items, users, clients. Override any progress. |
| **OWNER** | Analytics dashboard — read-only. |
| **MANAGER** | Analytics dashboard — read-only. |
| **SALES** | Analytics dashboard — read-only. |
| **QC** | QC queue — processes items in the QC stage. |
| **DELIVERY** | Delivery queue — processes items in the Delivery stage. |
| **FINANCE** | Finance dashboard — manages invoice status. |
| **DRAFTER** | Manages drawing approval for items in the Drafting stage. |
| **PURCHASING** | Manages material procurement progress. |

### Dynamic Operator Roles
Each production department configured by Superadmin automatically creates a corresponding operator role: `OPERATOR_{DEPARTMENT_NAME}`.

Example: Superadmin adds "Machining" → `OPERATOR_MACHINING` role becomes available for assignment.

Roles stay in sync with configured departments automatically.

### Assignment Rule
Items are assigned to **departments**, never to individual users. QC and Delivery use a queue model — any user with that role can pick up any item in that stage.

### Permission Truth Table

| Action | ADMIN | OWNER / MANAGER / SALES | OPERATOR | QC | DELIVERY | FINANCE |
|--------|:-----:|:------------------------:|:--------:|:--:|:--------:|:-------:|
| Create / Edit PO | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update own department progress | ✅ override | ❌ | ✅ | ✅ | ✅ | ❌ |
| QC Pass / Fail decision | ✅ override | ❌ | ❌ | ✅ | ❌ | ❌ |
| Mark item as Delivered | ✅ override | ❌ | ❌ | ❌ | ✅ | ❌ |
| Mark Invoiced / Paid | ✅ override | ❌ | ❌ | ❌ | ❌ | ✅ |
| View all items (Board) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analytics dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Report a problem | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Trigger client return | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Admin override any progress | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

> All Admin overrides are permanently logged in the audit trail as `ADMIN_OVERRIDE`.

---

## AUTHENTICATION

### Login Flow
1. User selects their Department / Role icon from the login screen.
2. A panel slides up showing all active users in that department.
3. User taps their name.
4. A numeric PIN pad appears. User enters their PIN.
5. Correct PIN → session created → redirect to role home route.
6. Wrong PIN → shake animation + error message + brief cooldown.

### PIN Specification

| Property | Superadmin | Factory Staff |
|----------|-----------|---------------|
| Length | 6 digits | 4 digits |
| Type | Numeric only | Numeric only |
| Storage | Hashed (never plain text) | Hashed (never plain text) |
| Default on create | N/A | Auto-generated memorable pattern (e.g. 2468, 1357) |

### Session Rules
- Sessions **never expire** — user stays logged in indefinitely.
- Logout only via explicit logout action.
- PIN reset is the only recovery mechanism for lost/shared devices.
- No remote session invalidation.

### PIN Self-Change
User can change their own PIN from Profile. No old PIN required. Toast confirms success.

### Forgot PIN Flow
Login screen "Forgot PIN?" opens a WhatsApp deep link to the Admin's number with a pre-filled message. Recovery is out-of-band (Admin communicates new PIN directly to user).

### Role → Home Route

| Role | Home Route |
|------|-----------|
| ADMIN | `/pos` (Production Order list) |
| OWNER / MANAGER / SALES | `/dashboard` (Analytics) |
| FINANCE | `/finance` |
| DRAFTER / PURCHASING / OPERATOR / QC / DELIVERY | `/tasks` (Task list) |

---

## DATA MODEL (Logical, No Code)

### Entities and Relationships

**Workspace** → has one configuration (branding, departments, thresholds).

**Department** → created by Superadmin, ordered, named. Each active department appears as a production stage for items.

**Client** → factory's customer. Has a name and an optional contact. Multiple POs can belong to one client.

**Production Order (PO)**
- Has one internal auto-generated number + one client-provided number.
- Belongs to one Client.
- Has a due date, urgency flag, notes, and a computed status.
- Contains one or more Items.

**Item**
- Belongs to one PO.
- Has a name, quantity, and a `work_type` — the list of departments that must process it.
- Has a single `status` that advances through the stage pipeline.
- Tracks drawing approval state and revision count (Drafting stage).
- Tracks purchasing milestone progress (Purchasing stage).
- Tracks timestamps for every stage entry (for dwell time analytics).
- Tracks rework/return lineage — parent/child relationships.
- Tracks invoice status (Finance stage).

**ItemProgress** — one record per (Item × Department).
- Stores a 0–100 progress value per department.
- Stores start and completion timestamps per department.

**Problem** — a reported issue on an item.
- Has a category, a note, a reporter (user or system), a resolution state, and an optional resolution note.
- Never blocks production.

**AuditLog** — append-only record of every significant action.
- Stores: who, what action, from value, to value, timestamp, and optional metadata.
- Never deleted.

**Notification** — in-app only. Targeted by role.

---

## SHARED TASK CARD / ITEM DETAIL SURFACE

This is the main cross-role operational surface.

- Every item appears through the same underlying task-card / item-detail model across `/tasks`, `/board`, `/pos/[id]`, `/finance`, and dashboard drill-downs.
- Each role sees the full item context: PO, client, quantity, urgency, current stage, all department progress, problems, rework/return lineage, delivery status, and finance state where permitted.
- Each role can only mutate the actions allowed by their permission scope.
- Operator pages are not isolated data silos. A Machining operator can see Drafting, Purchasing, Fabrication, QC, Delivery, and Finance context, but can only update Machining progress.
- All confirmed mutations update the same source of truth and are reflected everywhere: task cards, board, PO detail, notifications, audit trail, and KPI/dashboard metrics.
- Dashboard metrics are derived from the same item/task data, not from separate reporting records.

---

## STAGE PIPELINE

### The Flow
```
DRAFTING → PURCHASING → [PRODUCTION ZONE] → QC → DELIVERY → DONE
```

### Stage Definitions

| Stage | Who Owns It | How It Advances |
|-------|-------------|-----------------|
| **DRAFTING** | DRAFTER | Drafter approves drawing → advances to PURCHASING. Drafter requests redraw → item stays, revision count increments, system creates a problem, Admin + Manager notified. |
| **PURCHASING** | PURCHASING | Progress tracked across 3 milestones: Order placed (33%) → Vendor confirmed (66%) → Material arrived (100%). Non-blocking — item can enter Production before Purchasing is 100%, but a system problem is auto-created and auto-resolved when Purchasing catches up. |
| **PRODUCTION** | OPERATOR_* | Each assigned department independently tracks 0–100% progress. Item auto-advances to QC only when **all** assigned departments have reached 100%. Departments work in parallel. |
| **QC** | QC | Explicit gate decision — three paths (Pass, Minor defect, Major defect). No auto-advance. |
| **DELIVERY** | DELIVERY | Delivery operator confirms shipment quantity. On confirmation → item status = DONE, Finance is notified. |
| **DONE** | System | Terminal, irreversible. Finance invoicing unlocks. |

> **Drafting bypass rule:** If no DRAFTER users exist in the workspace, Drafting auto-advances to Purchasing immediately on PO creation.

### Stage Entry Timestamps
Every time an item enters a new stage, a `{stage}_started_at` timestamp is recorded on the item. This is the source of truth for dwell time analytics.

---

## PRODUCTION LOGIC

### Progress Update Rules

| Rule | Behavior |
|------|----------|
| **Only Forward** | Progress can never decrease. The slider/stepper minimum is always the current saved server value. |
| **Fresh Fetch** | Every time an operator opens an item, progress is fetched fresh from the server — never from local cache. |
| **Last Write Wins** | Concurrent updates: the last request to reach the server wins. |
| **Auto-Advance** | When all assigned department counters reach 100%, the item automatically advances to QC. |
| **Audit Trail** | Every progress update is logged: who, from value, to value, timestamp. |

### 5-Second Cancel Window
When an operator saves a progress update:
1. A toast appears: "Progress saved ✓ — Undo?" with a 5-second countdown.
2. If the user taps "Undo" within 5 seconds → the update is discarded, no server write occurs, no real-time event fires.
3. If 5 seconds pass without cancellation → the value commits to the server and a real-time event fires to all connected clients.

> The real-time broadcast fires **only** after the cancel window closes without cancellation.

### Progress Mechanic by Item Quantity

| Item Qty | Mechanic |
|----------|----------|
| qty = 1 | Slider from 0–100% |
| qty > 1 | Quantity stepper — "Completed: n / total pcs" with quick-add shortcuts (+5, +10, +20, All) |

---

## QC GATE PROTOCOL

When a QC operator marks an item as complete (100%), a decision gate opens immediately.

### Path A — All Pass
- Item advances directly to Delivery.
- QC pass timestamp recorded.
- Audit logged.
- Real-time event fires.

### Path B — Minor Defect (Same Item, Rework)
- Item stays in QC, progress resets to 0.
- Item is permanently marked as rework (badge never cleared).
- Rework type = MINOR.
- Admin + Manager notified.
- Item re-enters the QC queue for re-inspection.

### Path C — Major Defect (Spawn New Child Item)

**Partial fail** (some units pass, some fail):
- Original item: quantity updates to passing units → advances to Delivery.
- New child item spawned: quantity = failing units, status = PRODUCTION, all department progress reset to 0, permanently marked as rework, rework type = MAJOR.

**Total fail** (all units fail):
- Original item record stays — status does not advance.
- New child item spawned with the original full quantity.

**Rework Reasons (predefined):**
- Dimensions out of spec
- Surface / finishing defect (NG)
- Crack or fracture
- Wrong material
- Other (free-text note required)

---

## REWORK & RETURN PROTOCOLS

### Rework Badge
- Applied permanently at the moment of QC fail.
- Never cleared — even if the rework item subsequently passes QC.
- Visible to all roles at all stages.

### Client Return Protocol
When a delivered item is returned by the client:
1. The original DONE item is never modified (DONE is terminal).
2. A new child item is spawned with source = RETURN, status = PRODUCTION.
3. The child item re-enters the full production pipeline: PRODUCTION → QC → DELIVERY.
4. Finance is notified — original item shown as pending re-delivery.
5. The return item is hidden from Finance tabs until it completes and reaches DONE again.
6. On re-delivery, it appears in Finance with a red RETURN badge and is treated like any other item for invoicing.

### Lineage Pill (Visual)
- Rework child: orange pill — "↩ RW from [parent item name]"
- Return child: red pill — "↩ RETURN from [parent item name]"
- Always references the immediate parent.

---

## FLAG / URGENCY SYSTEM

### Four Flag Levels

| Level | Name | Trigger |
|-------|------|---------|
| 1 | **NORMAL** (green) | Default on PO creation |
| 2 | **ORANGE** | Days remaining ≤ Threshold 1 (default: 7 days) |
| 3 | **RED** | Days remaining ≤ Threshold 2 (default: 3 days) |
| 4 | **BLOOD_RED** | Past due date |

### Escalation Logic
The system computes days remaining from `due_date` to today (factory timezone). Flags are computed dynamically — not stored.

### Override Rules
- Admin **can manually escalate** the flag level higher.
- Admin **cannot manually de-escalate** — only extending the due date lowers the flag.
- System auto-lowers the flag if the due date is extended beyond the threshold.

### Thresholds
Default: Threshold 1 = 7 days, Threshold 2 = 3 days. Configurable per workspace by Superadmin only.

### Visual Representation
Flag color displayed as a left border accent on all PO and item cards.

### Sort Priority
BLOOD_RED → RED → ORANGE → NORMAL (most urgent always at top).

---

## FINANCE FLOW

### Three Invoice States
```
PENDING → INVOICED → PAID
```

| State | Trigger | Actor |
|-------|---------|-------|
| PENDING | Item reaches DONE | System (automatic) |
| INVOICED | Finance marks invoice sent | Any FINANCE user |
| PAID | Finance marks payment received | Any FINANCE user |

### Rules
- Finance operates at the **individual item level**, not per PO.
- No monetary values are stored anywhere in the system.
- Every state change is logged in the audit trail.
- PAID → INVOICED reversal is allowed (for corrections).
- Return items are not invoiceable until they complete re-production and re-delivery.

### PO Status Auto-Computation
- All items PAID → PO status = CLOSED
- All items DONE (but not all PAID) → PO status = FINISHED
- Otherwise → PO status = ACTIVE

---

## PROBLEM REPORTING

- Any operator can report a problem on any item at any time.
- Problems **never block or stop** production.
- Problems are one-tap to resolve, with an optional resolution note.
- Problem categories: Material not arrived, Material mismatch, Machine/tool failure, Operator unavailable, Drawing/spec unclear, Other (free-text required).
- System auto-creates problems for anomalies (e.g. drawing redraw, production starting before purchasing complete).
- System problems auto-resolve when their triggering condition clears.

### Resolution Permissions
- The reporter: can always resolve their own problems.
- Same-stage operators: can resolve problems on items in their current stage.
- Admin and Manager: can resolve any problem at any time.

---

## NOTIFICATIONS

**Delivery method:** In-app only. No external production/status notification channels.

### Notification UI
- Bell icon appears at the top-right of authenticated factory staff screens.
- Bell shows unread count.
- Tapping the bell opens an in-app drawer/list.
- Tapping a notification navigates to the relevant PO, item, task, finance item, or problem view.
- Notifications can be marked read.
- Superadmin configuration screens are outside the factory staff notification model.

| Event | Who Receives It |
|-------|----------------|
| New PO created | All operators in all relevant departments |
| Item advances to a new stage | Operators of the next stage |
| Problem reported on an item | OWNER, MANAGER, ADMIN |
| Drawing redraw flagged | ADMIN, MANAGER |
| Urgency flag escalates | OWNER, MANAGER, ADMIN |
| Item marked Rework (QC fail) | OWNER, MANAGER, ADMIN |
| Item DONE (Delivered) | FINANCE, OWNER, MANAGER |
| Finance marks PAID | OWNER, MANAGER |

---

## ANALYTICS DASHBOARD

**Access:** ADMIN, OWNER, MANAGER, SALES. Finance cannot access analytics.

**Period filter:** 1 Month / 3 Months / 6 Months / 12 Months (default: 3M).

### KPI Cards

| Metric | How It's Calculated |
|--------|--------------------|
| Total POs | Count of POs created in period |
| On-Time % | (On-time deliveries ÷ Total deliveries) × 100 |
| Avg Lead Time | Mean of (completion date − creation date) across all completed items |
| Total Overdue Items | Count of items with BLOOD_RED flag |
| Total Rework Items | Count of items where rework flag is true |
| Stalled Items | Items with no progress update in the last 24 hours (computed live, not stored) |

### Charts

| Chart | Type | Logic |
|-------|------|-------|
| On-Time vs Late | Grouped bar by month | Teal = on-time, Red = late |
| Bottleneck by Department | Horizontal bar (avg dwell days per dept) | Highest bar highlighted red |
| Rework Reasons | Donut | One slice per reason category |

### Sticky Summary Bar
When KPI cards scroll out of viewport, a sticky bar appears:
`● [n] Active POs · [n]% On-Time · ⚠ Bottleneck: [DEPT]`

---

## PDF EXPORT
- Available to: ADMIN, MANAGER, OWNER, SALES.
- Generated server-side.
- Every page includes a watermark: "Exported by [User Name] · [Date & Time]"

---

## PUBLIC DEMO
- Public route — no login required.
- Uses hardcoded mock data — zero database connection.
- Read-only. Simulates real-time updates via client-side Pusher simulation.
- Demo state is a pure function of the current time modulo 24 hours — no cron needed, auto-resets every 24 hours.

---

## NAVIGATION, APP SHELL, AND PROFILE

### Global Shell
- Authenticated factory staff use a mobile-first app shell.
- A notification bell appears at the top-right of authenticated screens.
- The bell opens the in-app notification drawer/list.
- Notification count updates live when new in-app notifications are created.
- Superadmin is excluded from the public factory staff navigation model.

### Bottom Navigation
Bottom navigation is role-aware but always keeps the same mental model: Home / Main Work / Board / Profile.

| Role Group | Home | Main Work | Board | Profile |
|------------|------|-----------|-------|---------|
| ADMIN | `/pos` | `/pos/new` or PO management entry | `/board` | `/profile` |
| OWNER / MANAGER / SALES | `/dashboard` | `/board` read-only drill-down | `/board` | `/profile` |
| DRAFTER / PURCHASING / OPERATOR / QC / DELIVERY | `/tasks` | `/tasks` role-specific queue | `/board` | `/profile` |
| FINANCE | `/finance` | `/finance` invoice tabs | `/board` | `/profile` |

### Profile
Available to all authenticated factory staff.

Allowed actions:
- Change own display name.
- Change own PIN.
- Logout.

Not allowed from Profile:
- Change role.
- Change department.
- Change other users.
- Access workspace configuration.

Admin user management remains under `/settings/users`.

---

## PAGES & ROUTES

| Route | Who Can Access | Purpose |
|-------|---------------|---------|
| `/login` | Public | Department icon → user name → PIN pad |
| `/dashboard` | ADMIN, OWNER, MANAGER, SALES | Analytics & KPI |
| `/pos` | ADMIN | Home — KPI cards + active PO list |
| `/po` | ADMIN | Full PO list with tab filters |
| `/pos/new` | ADMIN | Create new PO |
| `/pos/[id]` | All roles | PO detail — all items, timeline, activity log |
| `/tasks` | All operators | Role-filtered task list |
| `/board` | All roles | Global floor view — all items, all stages |
| `/profile` | All authenticated factory staff | Change display name, change own PIN, logout |
| `/problems` | ADMIN | All open problems across all POs |
| `/finance` | FINANCE | Invoice management |
| `/settings` | ADMIN | Workspace settings hub (tabs) |
| `/settings/users` | ADMIN | User management |
| `/settings/clients` | ADMIN | Client database |
| `/settings/flags` | ADMIN | View flag thresholds (read-only) |
| `/superadmin` | SUPERADMIN only | Platform configuration |
| `/demo` | Public | Demo — no login |

---

## PO CREATION FLOW

### PO Header Fields

| Field | Required | Behavior |
|-------|----------|----------|
| Internal PO Number | Yes | Auto-generated from template (editable) |
| Client PO Number | No | Manual free-text entry |
| Customer | Yes | Searchable dropdown from client database |
| Add New Customer | — | Opens a bottom sheet to add client inline — new client auto-selects in dropdown |
| PO Date | Yes | Auto-fills to today |
| Delivery Deadline | No | Manual date picker |
| Notes | No | Free text |
| Urgent toggle | — | Manual flag escalation |
| Vendor Job toggle | — | Marks PO as external vendor job |

### Per-Item Fields (repeatable)

| Field | Required | Behavior |
|-------|----------|----------|
| Item Name | Yes | Free text |
| Specification | No | Technical spec notes |
| Quantity | Yes | Numeric stepper, default = 1 |
| Unit | No | Default = "pcs" |
| Production Departments | Yes (min 1) | Multi-select from configured departments |

### Validation
- Required fields show a red border per field on submit attempt.
- No auto-scroll to first error.

### On Successful Creation
- Redirect to the new PO detail page.
- Urgency flag computed from due date immediately.
- All relevant operators receive an in-app notification.
- Items immediately visible on Board to all roles.

---

## OPERATOR TASK FLOW

### Task List (`/tasks`)

- Shows all items relevant to the operator's department.
- Search is global (all items, all departments) — items outside the operator's department are visible but read-only.
- **Active tab:** items currently in any active stage (Drafting through Delivery).
- **Archive tab:** completed items (DONE) from the operator's department — read-only, filterable by month.
- Filter chips (Active tab only): Delayed · Due Soon · In Progress (had activity in last 24h).

### Default Sort Order (Active Tab)
1. Most overdue (longest past due date)
2. Nearest upcoming deadline
3. Urgent flag (RED before ORANGE)
4. Rework items

### Item Card Information
- Urgency flag color (left border)
- Item name + any rework/return badge
- Client name + quantity + overdue duration
- Department chip (shows which dept owns this item)
- Progress snapshot across all departments
- Progress bar
- Last activity: username · time · department → progress value

### Update Panels (Role-Specific)

**Production Operator:** Shows own department's progress stepper + read-only view of all other departments' progress. Includes "Report Problem" option.

**Drafter:** Two actions — "Approve Drawing" (advances to Purchasing) or "Request Redraw" (increments revision, stays in Drafting, auto-creates a problem, notifies Admin + Manager).

**Purchasing:** Three milestone checkboxes — Order placed (33%) → Vendor confirmed (66%) → Material arrived (100%). Cannot go backward.

**QC:** Three-way quantity split — Pass qty / Minor defect qty / Major defect qty. Total must equal item quantity before submission. Includes "Report Problem" option.

**Delivery:** Confirm shipped quantity → item becomes DONE → Finance notified. Also: trigger client Return from this panel.

---

## ADMIN VIEW LOGIC

### Home (`/pos`)
- 4 KPI cards: Overdue · Due Soon · Open Problems · Completed
- Stats: Avg delay (days) + Worst PO (hours overdue)
- Active PO list sorted by urgency descending

### PO List (`/po`)
- Tabs: All / Overdue / Urgent
- Sorted: overdue first, then by due date ascending within each tab

### PO Detail (`/pos/[id]`)
- Header stats: Progress % · Hours Overdue · Problem Count
- Per-item timeline dots (per department): Done · In Progress · Not Started · Has Problem
- "View Activity Log" expands a chronological log for each item (bottom sheet)
- Admin can edit PO header fields (bottom sheet): Client · Client PO Number · Due Date · Urgency · Notes
- **Delete PO Guard:**
  1. Blocked entirely if any item is DONE or has PAID invoice status. Displays reason.
  2. If eligible: shows consequences (item count affected).
  3. Requires Admin to enter their own PIN to confirm deletion.
  4. Wrong PIN → shake animation, no deletion.
  5. Correct PIN → PO and all items deleted → redirects to PO list.
  6. Deletion logged in audit trail.

### Problems (`/problems`)
- Lists all open problems across all POs.
- Default sort: most severe + most overdue first.
- Filter by PO / department / urgency level.
- Resolve: opens a confirmation sheet with optional resolution note.

### Settings (`/settings`) — Admin Workspace Settings
- Admin-only workspace settings hub.
- **Users tab:** List all users with name, role, active status. Tap a user to expand inline → Reset PIN or Toggle active/inactive. Reset PIN generates a new memorable PIN displayed inline. "Add User" form appears inline above the list — on creation, the auto-generated PIN is displayed before the form closes.
- **Clients tab:** Client database management.
- **Flags tab:** Read-only view of urgency thresholds. Text explains thresholds are set by the platform owner.
- Personal profile actions are not here for non-admins. They live in `/profile` for all authenticated factory staff.

---

## FINANCE VIEW LOGIC

### Finance Dashboard (`/finance`)
- Summary header: 3 counts — Pending · Invoiced · Paid
- Global search: scope = item name · client name · PO number
- Client filter dropdown (searchable)
- Three tabs: Pending / Invoiced / Paid

### Per-Tab Actions

| Tab | Action Available |
|-----|-----------------|
| Pending | Mark as Invoiced |
| Invoiced | Mark as Paid |
| Paid | Reverse to Invoiced (correction) |

All actions require a bottom sheet confirmation before executing.

### Return Items in Finance
- Hidden from all Finance tabs while the return item is still in re-production.
- Appears in the Pending tab once re-delivered (DONE), with a red RETURN badge.
- Treated identically to a normal item for invoicing.

---

## AUDIT TRAIL

Every significant action is logged immutably. Key logged actions:

| Action | Trigger |
|--------|---------|
| `PROGRESS_UPDATE` | Any operator updates progress |
| `STAGE_ADVANCE` | Item moves to next stage |
| `ADMIN_OVERRIDE` | Admin overrides any item directly |
| `QC_PASS` | QC approves item |
| `QC_MINOR_FAIL` | QC marks minor defect |
| `QC_MAJOR_FAIL` | QC marks major defect |
| `REWORK_SPAWNED` | New child item created from QC fail |
| `RETURN_SPAWNED` | New child item created from client return |
| `INVOICE_UPDATE` | Finance changes invoice status |
| `EDIT_PO_FIELD` | Admin edits any PO field |
| `FLAG_ESCALATE` | Admin manually escalates urgency |
| `DELETE_PO` | Admin deletes a PO |
| `PROBLEM_RESOLVED` | Any problem is resolved |
| `PIN_RESET` | Admin resets another user's PIN |
| `SELF_PIN_CHANGE` | User changes their own PIN |
| `USER_CREATED` | Admin adds a new user |
| `USER_TOGGLED` | Admin activates or deactivates a user |

---

## OPEN DESIGN QUESTIONS (Pending)

| Topic | Status |
|-------|--------|
| Admin override progress — where in the UI does this appear? | Pending decision |
| Client settings UI — detailed design | TBD |

---

## WHAT POGRID IS NOT (Permanent Exclusions)

- ❌ ERP system
- ❌ Accounting or invoicing software (no prices, no amounts)
- ❌ File/attachment system
- ❌ External client portal
- ❌ Multi-language (English version is a rewrite context, product runs in one language)
- ❌ Gantt charts or per-stage deadlines
- ❌ Bill of Materials (BOM)
- ❌ Material Resource Planning (MRP)
- ❌ Barcode or IoT integration
- ❌ AI forecasting or demand planning
- ❌ WhatsApp, email, or push production/status notifications
- ❌ Individual user item assignment

---

*End of POgrid Factorized PRD*
*Source: PRD v5.1 — synchronized revision. Core logic preserved. All code removed. English PRD for AI agents; product UI remains Bahasa Indonesia.*
*Ready for AI agent brainstorming and design iteration.*
