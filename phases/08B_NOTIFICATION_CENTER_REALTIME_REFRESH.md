# Phase 8B — Notification Center and Realtime Refresh

**Purpose:** Implement persistent in-app notifications and realtime UI refresh.

---

## Required Work

- Build NotificationBell.
- Build NotificationDrawer.
- Unread count.
- Mark read/read-all.
- Create notification target by role/user.
- Subscribe to Pusher workspace/po/item/role/user channels as needed.
- Invalidate TanStack Query keys based on event type.
- Show realtime disconnected state.

---

## Forbidden / Guardrails

- No WhatsApp/email/Telegram/push workflow notifications.
- Pusher event payloads are IDs/metadata only.
- Notification records live in DB.

---

## Completion Gate

- New event updates notification count.
- Open task cards/drawers refresh after Pusher event.
- Disconnected state visible.
- Read/unread works.

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
