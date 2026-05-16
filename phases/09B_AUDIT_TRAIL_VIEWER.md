# Phase 9B — Audit Trail Viewer

**Purpose:** Make permanent action history inspectable.

---

## Required Work

- Build PO activity log bottom sheet.
- Build Item activity log bottom sheet.
- Display progress updates, stage advances, admin overrides, QC decisions, rework/return spawning, invoice updates, PO edits, delete PO, problem resolution, PIN reset, user changes.
- Sort chronological.
- Show actor, action, from value, to value, timestamp, metadata summary.

---

## Forbidden / Guardrails

- AuditLog cannot be edited or deleted.
- Sensitive metadata should not expose PINs or secrets.
- Admin overrides must be clearly labeled.

---

## Completion Gate

- Activity logs visible from PO detail/item drawer.
- Seed audit logs display correctly.
- New workflow actions appear in log.

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
