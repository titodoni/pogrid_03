# Phase 5B — Production Progress Loop

**Purpose:** Implement core operator progress loop and QC auto-advance.

---

## Required Work

- Build `/tasks` active/archive tabs.
- Implement operator own-department progress panel.
- Implement qty=1 slider.
- Implement qty>1 quantity stepper with +5/+10/+20/All.
- Show all other department progress read-only.
- Fetch fresh item progress when opening item.
- Prevent progress decrease.
- Auto-advance to QC when all assigned departments reach 100%.

---

## Forbidden / Guardrails

- Progress update uses 5-second undo engine.
- Concurrent updates use last-write-wins after server validation.
- Only own department can update unless Admin override.

---

## Completion Gate

- Operator updates own department only.
- Other views update via Pusher/TanStack invalidation.
- AuditLog created after commit.
- Item reaches QC only when all assigned departments complete.

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
