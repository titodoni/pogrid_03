# Phase 4B — Auth, PIN, Profile, and Superadmin Login

**Purpose:** Build factory login and PIN lifecycle.

---

## Required Work

- Public staff login: Department/Role icon → active user list → numeric PIN pad.
- Wrong PIN shake and cooldown.
- Staff PIN 4 digits hashed.
- Superadmin PIN 6 digits hashed.
- Superadmin login only at `/superadmin`.
- Forgot PIN WhatsApp deep link to Admin number.
- Profile PIN self-change.
- Admin reset PIN.
- Explicit logout.
- Persistent session.

---

## Forbidden / Guardrails

- No text username login for factory staff.
- No Superadmin option on `/login`.
- No plain-text PIN storage.
- Sessions do not expire automatically.

---

## Completion Gate

- Each role can log in using seeded PIN.
- Wrong PIN behaves correctly.
- Profile PIN change works.
- Admin reset PIN works.
- Superadmin route is hidden and guarded.

---

## Required Handoff Update

Before marking this phase complete, update:

```txt
CURRENT_PHASE.md
WHAT_EXISTS.md
KNOWN_ISSUES.md
NEXT_AGENT_PROMPT.md
MANUAL_COMMANDS_RUN.md
```
