# Phase 10A — Error, Empty, Loading, Offline, and Sync States

**Purpose:** Make the app safe and understandable when things go wrong.

---

## Required Work

- Loading states for each major route.
- Empty task/archive/notification/problem/finance states.
- Offline banner.
- Realtime disconnected indicator.
- Mutation failed state.
- Retry button.
- Unauthorized and forbidden states.
- Wrong PIN state.
- PO not found and item not found states.
- Stale data refreshed messaging.

---

## Forbidden / Guardrails

- No silent failures.
- No English UI copy unless internal/dev-only.
- Actions must be recoverable where possible.

---

## Completion Gate

- Each major route has loading/empty/error handling.
- Network failure behavior tested.
- Mutation retry tested.

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
