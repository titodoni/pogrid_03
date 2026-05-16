# Phase 7A — Delivery and Client Return

**Purpose:** Implement delivery confirmation and client return protocol.

---

## Required Work

- Delivery confirms shipped quantity.
- On confirmation item status becomes DONE.
- Finance notified.
- DONE is terminal.
- Delivery can trigger client return.
- Client return spawns child item with source RETURN and status PRODUCTION.
- Original DONE item is never modified.
- Return child hidden from Finance until re-delivered.

---

## Forbidden / Guardrails

- Do not modify DONE original on return.
- Return child re-enters full production path.
- Red RETURN badge appears after re-delivery in Finance.

---

## Completion Gate

- Delivery to DONE works.
- Finance receives item after DONE.
- Return child generated correctly.
- Original DONE remains unchanged.

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
