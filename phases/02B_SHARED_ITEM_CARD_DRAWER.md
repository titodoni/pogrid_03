# Phase 2B — Shared ItemTaskCard and ItemDetailDrawer

**Purpose:** Create one shared item-state UI contract reused across flows.

---

## Required Work

- Build ItemTaskCard.
- Build ItemDetailDrawer.
- Build ProgressSnapshot.
- Build DepartmentProgressRow.
- Build UrgencyBorder.
- Build ProblemBadge.
- Build LineagePill.
- Build RoleActionPanel slot.
- Support read-only and actionable modes.

---

## Forbidden / Guardrails

- ItemTaskCard and ItemDetailDrawer must not own business truth.
- No mutation logic inside display components.
- Same item state surface reused by `/tasks`, `/board`, `/pos/[id]`, `/finance`, and dashboard drilldowns.

---

## Completion Gate

- Components accept server/query data.
- Components render all required badges/progress states.
- Role action area is pluggable.
- No duplicate item card designs created.

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
