# Phase 8A — Problem Reporting and Resolution

**Purpose:** Implement problems as non-blocking workflow records.

---

## Required Work

- Operators can report problem on any item.
- Problem categories implemented.
- Other category requires note.
- Problems never block production.
- Reporter can resolve own problem.
- Same-stage operator can resolve current-stage problem.
- Admin/Manager can resolve any problem.
- Build `/problems` Admin view with filters.
- System-created problems auto-resolve when condition clears.

---

## Forbidden / Guardrails

- Problems are not blockers.
- Resolution permission is server-enforced.
- Resolution optional note supported.

---

## Completion Gate

- Problem creation works.
- Resolution rules work.
- Admin problem center works.
- Notifications created for problem reports.

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
