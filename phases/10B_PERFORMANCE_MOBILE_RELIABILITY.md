# Phase 10B — Performance Budget and Mobile Reliability

**Purpose:** Make POgrid fast enough for cheap phones and weak connections.

---

## Required Work

- Minimize `/tasks` client bundle.
- Avoid heavy global client components.
- Use list virtualization or pagination when item count grows.
- Debounce rapid taps.
- Tune TanStack Query stale times.
- Handle Pusher reconnect.
- Avoid blocking spinners after simple taps.
- Ensure large touch targets and drawer-first actions.

---

## Forbidden / Guardrails

- Performance cannot break correctness.
- Do not cache stale progress when opening item; fetch fresh.
- Realtime refetch must not spam server unnecessarily.

---

## Completion Gate

- Tasks screen feels responsive on mobile viewport.
- Repeated taps do not duplicate mutations.
- Reconnect refresh works.

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
