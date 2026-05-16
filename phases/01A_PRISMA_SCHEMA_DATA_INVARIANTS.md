# Phase 1A — Prisma Schema and Data Invariants

**Purpose:** Build database schema and hard invariants before UI.

---

## Required Work

- Define Workspace, Department, User, Session, Client, ProductionOrder, Item, ItemProgress, Problem, Notification, AuditLog.
- Model parent/child lineage for rework and return.
- Model item-level finance state.
- Model department-based assignment only.
- Add timestamps needed for dwell analytics.
- Add audit log append-only design.
- Exclude money fields and upload fields.

---

## Forbidden / Guardrails

- DONE is terminal.
- Progress cannot decrease.
- Invoice state belongs to item, not PO.
- Items are assigned to departments, never individual users.
- AuditLog is never edited or deleted by app logic.

---

## Completion Gate

- Prisma schema compiles.
- `npx prisma generate` succeeds.
- No money/upload/client-portal fields exist.
- Schema reviewed against database contract.

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
