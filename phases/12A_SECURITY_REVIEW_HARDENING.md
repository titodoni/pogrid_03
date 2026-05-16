# Phase 12A — Security Review and Hardening

**Purpose:** Harden internal app exposed on public domain.

---

## Required Work

- Review server-side role checks.
- Review PIN hashing.
- Review session cookie flags.
- Review rate limiting for PIN attempts.
- Review CSRF posture.
- Audit env vars.
- Confirm no secrets in client bundle.
- Review Pusher channel authorization if private channels are used.
- Confirm no upload endpoints.
- Confirm no monetary fields.
- Confirm `/superadmin` guarded.

---

## Forbidden / Guardrails

- Public domain does not mean public data.
- Internal app still needs strict server authorization.
- Security cannot rely on hidden buttons.

---

## Completion Gate

- Security checklist completed.
- Unauthorized access tests pass.
- Secrets audit passes.
- No forbidden features found.

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
