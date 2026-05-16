# Phase 9A — The Board, KPI Drilldown, and Analytics

**Purpose:** Build global floor visibility and traceable analytics.

---

## Required Work

- Build `/board` global floor view.
- Build `/dashboard` analytics for Admin/Owner/Manager/Sales.
- Period filter 1M/3M/6M/12M default 3M.
- KPI cards: Total POs, On-Time %, Avg Lead Time, Overdue Items, Rework Items, Stalled Items.
- Charts: On-Time vs Late, Bottleneck by Department, Rework Reasons.
- Sticky summary bar.
- Every KPI/drilldown opens exact item/PO list.

---

## Forbidden / Guardrails

- Finance cannot access analytics.
- No untraceable metrics.
- Stalled items computed live, not stored.
- Flags computed dynamically from due date and threshold.

---

## Completion Gate

- Dashboard renders seeded scenarios.
- KPI values can be traced to underlying records.
- Board shows all item stage context.
- Drilldowns work.

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
