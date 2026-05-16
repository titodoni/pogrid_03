# POgrid — Auth and PIN Contract

> POgrid authentication is role/department selection plus PIN. It is designed for factory workers, not office SaaS username/password login.

## Core Rules

- Public staff login route is `/login`.
- Superadmin route is `/superadmin`.
- Superadmin must not appear in public login.
- Staff login must not use username/password text fields.
- Staff login must use Department/Role icon → active users → PIN pad.
- PINs are numeric only.
- PINs are hashed and never stored as plaintext.
- Sessions never expire automatically.
- Logout only through explicit logout action.
- Forgot PIN uses WhatsApp deep link to Admin number.
- WhatsApp is not used for workflow notifications.

## Staff Login Flow

1. User opens `/login`.
2. User selects Department/Role icon.
3. A panel slides up showing active users in that department/role.
4. User taps their name.
5. Numeric PIN pad appears.
6. User enters 4-digit PIN.
7. Correct PIN creates session.
8. User redirects to role home route.
9. Wrong PIN triggers shake animation, error message, and brief cooldown.

## Superadmin Login Flow

1. User opens `/superadmin`.
2. Superadmin PIN pad appears.
3. User enters 6-digit PIN.
4. Correct PIN creates Superadmin session.
5. Wrong PIN triggers shake animation, error message, and cooldown.

Rules:

- `/superadmin` is hidden from public UI.
- It is not linked from bottom navigation.
- It may be bookmarked manually by platform owner.

## PIN Specification

| User Type | PIN Length | Type | Storage |
|---|---:|---|---|
| Factory Staff | 4 digits | Numeric only | Hashed |
| Superadmin | 6 digits | Numeric only | Hashed |

## Default Staff PIN

When Admin creates a staff user:

- Generate memorable 4-digit numeric PIN.
- Display it inline once before the form closes.
- Store only hashed value.
- Write AuditLog `USER_CREATED`.

When Admin resets a staff PIN:

- Generate new memorable 4-digit numeric PIN.
- Display it inline once.
- Store only hashed value.
- Write AuditLog `PIN_RESET`.

## Session Rules

- Session created after correct PIN.
- Session does not expire automatically.
- User stays logged in indefinitely.
- Logout explicitly ends session.
- No remote session invalidation in current PRD.
- PIN reset is recovery path for lost/shared devices.

## Role Home Redirects

| Role | Redirect After Login |
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

## Department/Role Login Icons

Public login should show active staff role groups:

- Admin
- Owner/Manager/Sales if applicable
- Drafter
- Purchasing
- Dynamic operator department roles
- QC
- Delivery
- Finance

Rules:

- Show only role groups with active users unless Admin wants empty role visibility later.
- Superadmin is excluded.
- Inactive users are excluded from user list.

## Forgot PIN Flow

Trigger:

- User taps `Lupa PIN?` on login screen.

Behavior:

- Opens WhatsApp deep link to Admin WhatsApp number configured by Superadmin.
- Message is pre-filled.
- Recovery happens out-of-band.

Example message intent:

```txt
Saya lupa PIN POgrid. Tolong reset PIN saya.
```

Rules:

- App does not send OTP.
- App does not send email.
- App does not automatically message WhatsApp.
- It only opens a deep link.

## Own Profile PIN Change

Route:

- `/profile`

Allowed:

- All authenticated users.

Behavior:

- User enters new PIN.
- No old PIN required.
- Staff PIN must be 4 digits.
- Superadmin PIN must be 6 digits.
- Store hashed PIN.
- AuditLog `SELF_PIN_CHANGE`.
- Sonner toast confirms success.

## Wrong PIN Behavior

UI:

- Shake animation on PIN pad.
- Error message.
- Brief cooldown before retry.

Server:

- Must compare hashed PIN safely.
- Must not reveal whether PIN was close or user exists beyond selected user context.

## Security Notes

- Use secure HTTP-only session cookie where applicable.
- Hash session tokens in database if persisted.
- Hash PINs with a password hashing algorithm suitable for short secrets.
- Rate limit PIN attempts at least per user/session/IP where practical.
- Avoid logging raw PIN input.

## Forbidden

- No username/password login for factory staff.
- No email login.
- No magic link login.
- No OAuth login.
- No visible Superadmin option in staff login.
- No plaintext PIN storage.
- No PIN shown after initial creation/reset display.
