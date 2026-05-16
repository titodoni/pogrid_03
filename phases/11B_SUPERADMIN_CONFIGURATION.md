# Phase 11B — Superadmin Configuration

**Purpose:** Build platform-owner workspace configuration.

---

## Required Work

- Build `/superadmin` hidden route and login.
- Workspace branding settings.
- Configure production departments: name, order, active/inactive.
- Dynamic operator role sync.
- PO number auto-generation template.
- Urgency thresholds.
- Admin WhatsApp number for Forgot PIN.
- Billing/subscription status placeholder or internal control.
- Database seeding/reset with PIN re-confirmation.

---

## Forbidden / Guardrails

- Superadmin is not part of factory public login.
- Department changes must not corrupt existing item progress history.
- Reset actions require PIN reconfirmation.

---

## Completion Gate

- Superadmin can configure workspace.
- New department creates operator role availability.
- Inactive departments stop appearing for new assignment but history remains inspectable.

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
