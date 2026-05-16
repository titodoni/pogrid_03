# Phase 4A — Server-Side Authorization and Role Guards

**Purpose:** Enforce permissions on the server for every route and mutation.

---

## Required Work

- Implement requireSession.
- Implement requireRole.
- Implement requireAdmin.
- Implement requireSameDepartmentOperator.
- Implement requireQC.
- Implement requireDelivery.
- Implement requireFinance.
- Implement requireSuperadmin.
- Implement assertCanViewItem.
- Implement assertCanMutateItemStage.

---

## Forbidden / Guardrails

- UI hiding is not security.
- Every mutation must call an appropriate guard.
- No role can mutate another department except Admin override.

---

## Completion Gate

- Unauthorized mutation attempts fail server-side.
- Route access matrix enforced.
- Admin override is logged as ADMIN_OVERRIDE where used.

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
