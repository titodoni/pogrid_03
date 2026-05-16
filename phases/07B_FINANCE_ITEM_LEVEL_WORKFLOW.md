# Phase 7B — Finance Item-Level Workflow

**Purpose:** Implement item-level invoice status without money.

---

## Required Work

- Build `/finance` dashboard.
- Summary counts: Pending, Invoiced, Paid.
- Search by item, client, PO number.
- Client filter dropdown.
- Tabs: Pending / Invoiced / Paid.
- Pending → Invoiced.
- Invoiced → Paid.
- Paid → Invoiced correction.
- Bottom sheet confirmation for all actions.
- PO auto-status: ACTIVE, FINISHED, CLOSED.

---

## Forbidden / Guardrails

- No monetary values.
- Finance operates at item level only.
- Return items hidden until DONE again.
- Every invoice update is audited.

---

## Completion Gate

- Finance flow works per item.
- PO status auto-computes correctly.
- Return item rules verified.
- AuditLog created.

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
