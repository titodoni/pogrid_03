# Phase 13B — Role-Based Manual QA

**Purpose:** Run one full workflow by role before accepting product.

---

## Required Work

- Admin creates PO.
- Drafter approves or redraws.
- Purchasing updates milestones.
- Machining updates progress.
- Fabrication updates progress.
- QC pass/minor/major fail.
- Delivery confirms.
- Finance invoices and marks paid.
- Manager checks Board/dashboard.
- Operator reports problem.
- Admin resolves problem.
- Delivery triggers return.
- Superadmin changes config in safe scenario.

---

## Forbidden / Guardrails

- QA must use mobile viewport first.
- Record issues in KNOWN_ISSUES.md.
- Do not accept phase if core workflow is broken.

---

## Completion Gate

- Full happy path passes.
- At least one rework path passes.
- At least one return path passes.
- Role access verified.

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
