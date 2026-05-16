# Phase 13A — Public Demo

**Purpose:** Build database-free demo route.

---

## Required Work

- Build `/demo` public route.
- Use hardcoded mock data only.
- No DB connection.
- Read-only.
- Simulate realtime client-side.
- State derived from current time modulo 24h.
- Auto-reset behavior without cron.

---

## Forbidden / Guardrails

- Demo cannot read or mutate production DB.
- Demo cannot expose internal data.
- Demo cannot require login.

---

## Completion Gate

- `/demo` works publicly.
- No database queries from demo.
- Readonly controls verified.

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
