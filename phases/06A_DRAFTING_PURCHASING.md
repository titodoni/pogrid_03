# Phase 6A — Drafting and Purchasing

**Purpose:** Implement early pipeline stages.

---

## Required Work

- Drafter approve drawing → advances to Purchasing.
- Drafter request redraw → stays Drafting, increments revision, creates problem, notifies Admin/Manager.
- Drafting bypass if no DRAFTER users exist.
- Purchasing milestones: Order placed 33%, Vendor confirmed 66%, Material arrived 100%.
- Purchasing cannot go backward.
- Production may start before Purchasing complete but system problem is auto-created and auto-resolved when purchasing catches up.

---

## Forbidden / Guardrails

- Do not block production on Purchasing incomplete.
- System problems must be distinguishable from user-reported problems.
- Stage entry timestamps must be recorded.

---

## Completion Gate

- Drafting approve path works.
- Redraw path creates problem and notification.
- Purchasing milestone progression works.
- Bypass rule tested.

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
