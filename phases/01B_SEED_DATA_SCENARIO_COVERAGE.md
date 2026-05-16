# Phase 1B — Seed Data and Scenario Coverage

**Purpose:** Create realistic seed scenarios so screens and workflows can be tested immediately.

---

## Required Work

- Seed workspace and departments.
- Seed all static roles and production operator roles.
- Seed Admin, Owner, Manager, Sales, Drafter, Purchasing, Machining, Fabrication, QC, Delivery, Finance users.
- Seed clients.
- Seed normal, urgent, overdue, active, done, rework, return, and finance-state POs/items.
- Seed item progress across multiple stages.
- Seed problems, notifications, and audit logs.

---

## Forbidden / Guardrails

- Seed data must not contain money.
- Seed data must use factory-relevant Indonesian-facing names where UI-visible.
- Seed must be deterministic and repeatable.

---

## Completion Gate

- `npx prisma db seed` succeeds.
- Login users have known PINs for development.
- Every major route has visible data.
- Seed scenarios documented.

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
