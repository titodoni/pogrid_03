# Phase 6B — QC Gate and Rework

**Purpose:** Implement explicit QC decision gate and rework spawning.

---

## Required Work

- QC decision gate opens when QC marks item complete.
- All Pass → Delivery.
- Minor defect → item stays QC, progress resets, permanent rework badge, notify Admin/Manager.
- Major defect partial fail → original passing qty to Delivery, child failing qty to Production.
- Major defect total fail → original stays, child full qty to Production.
- Predefined rework reasons.
- Lineage pill for child item.

---

## Forbidden / Guardrails

- QC never auto-advances without explicit decision.
- Rework badge is permanent.
- Child items preserve parent lineage.
- Audit all QC decisions and spawned rework.

---

## Completion Gate

- QC pass works.
- Minor defect works.
- Partial major fail works.
- Total major fail works.
- Lineage and badges render.

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
