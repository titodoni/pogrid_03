# Phase 5A — Admin PO Creation and PO Detail

**Purpose:** Enable Admin to create and inspect production orders.

---

## Required Work

- Build `/pos` Admin home.
- Build `/po` full list.
- Build `/pos/new` PO creation.
- Build `/pos/[id]` detail.
- Implement client dropdown and inline add client.
- Implement repeatable items with qty, unit, specification, and production departments.
- Redirect to PO detail after create.
- Create initial item progress records.
- Notify relevant departments.

---

## Forbidden / Guardrails

- No money fields.
- No attachments.
- Required fields show red borders on submit.
- No auto-scroll to first error.
- Items immediately visible on Board to all roles.

---

## Completion Gate

- Admin can create PO with multiple items.
- Operators can see relevant tasks after PO creation.
- Audit/notification records created.
- PO detail shows all item context.

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
