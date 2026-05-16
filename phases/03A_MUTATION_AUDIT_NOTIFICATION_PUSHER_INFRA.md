# Phase 3A — Mutation, Audit, Notification, and Pusher Infrastructure

**Purpose:** Create backend mutation pipeline used by all workflow actions.

---

## Required Work

- Create server mutation wrapper.
- Create role guard helper.
- Create audit log helper.
- Create notification creation helper.
- Create Pusher server helper.
- Create Pusher client subscription hook.
- Create TanStack Query provider.
- Define query invalidation map.
- Standardize mutation error format.

---

## Forbidden / Guardrails

- Database transaction first, Pusher after commit.
- AuditLog required for significant actions.
- Notifications are persistent DB records, not just toasts.
- Pusher sends IDs/metadata only, not full business objects.

---

## Completion Gate

- Sample test mutation writes DB, AuditLog, Notification, and emits Pusher event.
- Client receives event and invalidates query.
- Error shape is consistent.

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
