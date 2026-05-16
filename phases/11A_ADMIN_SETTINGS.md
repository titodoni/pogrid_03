# Phase 11A — Admin Settings

**Purpose:** Build factory Admin settings pages.

---

## Required Work

- Build `/settings` tabbed hub.
- Users tab: list, add user, reset PIN, toggle active/inactive.
- Clients tab: client database management.
- Flags tab: read-only urgency thresholds with explanation.
- Auto-generated memorable PIN displayed once after create/reset.

---

## Forbidden / Guardrails

- Admin cannot change Superadmin-only flag thresholds.
- PINs never stored plain text.
- User role assignment must sync with active departments.

---

## Completion Gate

- Admin can add/deactivate users.
- Admin can reset PIN.
- Clients CRUD works.
- Flags view is read-only.

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
