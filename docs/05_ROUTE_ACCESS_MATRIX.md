# POgrid — Route Access Matrix

> This file defines route-level authorization, landing routes, redirects, and navigation visibility.

## Universal Route Rules

- Public staff login is `/login`.
- Superadmin login/config is `/superadmin` only.
- Superadmin is hidden from public login UI.
- Authenticated factory staff must not access `/login` unless logged out.
- Unauthorized access redirects to the user’s role home route.
- Unauthenticated access redirects to `/login`, except `/demo` and `/superadmin`.
- Bottom navigation appears on authenticated factory staff pages.
- `/profile` is available to all authenticated factory staff.
- `/settings` is Admin workspace settings, not personal profile.

## Role Home Routes

| Role | Home Route |
|---|---|
| ADMIN | `/pos` |
| OWNER | `/dashboard` |
| MANAGER | `/dashboard` |
| SALES | `/dashboard` |
| FINANCE | `/finance` |
| DRAFTER | `/tasks` |
| PURCHASING | `/tasks` |
| OPERATOR_* | `/tasks` |
| QC | `/tasks` |
| DELIVERY | `/tasks` |
| SUPERADMIN | `/superadmin` |

## Route Matrix

| Route | Access | Purpose | Unauthorized Redirect | Bottom Nav |
|---|---|---|---|---|
| `/login` | Public staff | Department/Role icon → user → PIN | Role home if already logged in | No |
| `/superadmin` | SUPERADMIN only | Platform/workspace configuration | `/login` or forbidden screen | No staff nav |
| `/demo` | Public | Read-only public demo with mock data | None | No |
| `/dashboard` | ADMIN, OWNER, MANAGER, SALES | Analytics and KPI dashboard | Role home | Yes |
| `/pos` | ADMIN | Admin home: KPI cards and active PO list | Role home | Yes |
| `/po` | ADMIN | Full PO list with filters | Role home | Yes |
| `/pos/new` | ADMIN | Create new PO | Role home | Yes |
| `/pos/[id]` | All authenticated factory roles | PO detail and item context | `/login` if unauthenticated | Yes |
| `/tasks` | DRAFTER, PURCHASING, OPERATOR_*, QC, DELIVERY, ADMIN optional | Role-filtered task list | Role home | Yes |
| `/board` | All authenticated factory roles | Global floor view | `/login` if unauthenticated | Yes |
| `/problems` | ADMIN | Open problem center | Role home | Yes |
| `/finance` | FINANCE | Invoice management | Role home | Yes |
| `/settings` | ADMIN | Workspace settings hub | Role home | Yes |
| `/settings/users` | ADMIN | User management | Role home | Yes |
| `/settings/clients` | ADMIN | Client database | Role home | Yes |
| `/settings/flags` | ADMIN | Read-only urgency thresholds | Role home | Yes |
| `/profile` | All authenticated factory roles | Own profile, change PIN, logout | `/login` if unauthenticated | Yes |

## Bottom Navigation by Role

### ADMIN

Items:

- `PO` → `/pos`
- `Board` → `/board`
- `Masalah` → `/problems`
- `Settings` → `/settings`
- `Profil` → `/profile`

Optional Admin dashboard access can be top action or card link:

- `Dashboard` → `/dashboard`

### OWNER / MANAGER / SALES

Items:

- `Dashboard` → `/dashboard`
- `Board` → `/board`
- `Profil` → `/profile`

No mutation-heavy settings.

### DRAFTER / PURCHASING / OPERATOR_* / QC / DELIVERY

Items:

- `Tugas` → `/tasks`
- `Board` → `/board`
- `Profil` → `/profile`

### FINANCE

Items:

- `Finance` → `/finance`
- `Board` → `/board`
- `Profil` → `/profile`

Finance has no analytics access.

## Top Bar Rules

Authenticated pages should show:

- Current page title
- Notification bell
- Optional role badge
- Optional workspace branding

Notification bell appears for all authenticated factory staff.

## Login Flow Routing

After successful PIN:

- ADMIN → `/pos`
- OWNER/MANAGER/SALES → `/dashboard`
- FINANCE → `/finance`
- DRAFTER/PURCHASING/OPERATOR/QC/DELIVERY → `/tasks`

Wrong PIN:

- Stay on PIN panel.
- Shake animation.
- Error message.
- Brief cooldown.

## Forbidden Route Behavior

Do not:

- Show Superadmin inside public role icons.
- Send workers to a no-navbar task page.
- Let Finance access analytics.
- Let operators access Admin settings.
- Let public users access Board, Tasks, Finance, or PO detail.
- Create `/admin/login` unless explicitly requested.
