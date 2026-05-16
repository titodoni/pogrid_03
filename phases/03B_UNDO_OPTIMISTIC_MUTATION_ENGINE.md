# Phase 3B — 5-Second Undo and Optimistic Mutation Engine

**Purpose:** Implement progress delayed-commit behavior exactly as PRD requires.

---

## Required Work

- Build pending local mutation state.
- Show Sonner undo toast with 5-second countdown.
- Allow cancel before server commit.
- Commit after timeout if not cancelled.
- Prevent DB write when cancelled.
- Prevent AuditLog when cancelled.
- Prevent Pusher event when cancelled.
- Handle commit failure and retry/error state.
- Reject server update lower than saved progress.

---

## Forbidden / Guardrails

- Do not save first then rollback.
- Do not broadcast during undo window.
- Do not treat Sonner as persistent notification.

---

## Completion Gate

- Undo within 5 seconds leaves database unchanged.
- No AuditLog/Pusher after cancelled update.
- Commit after 5 seconds persists and broadcasts.
- Other open views refresh after broadcast.

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
