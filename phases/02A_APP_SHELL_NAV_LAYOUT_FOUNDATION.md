# Phase 2A — App Shell, Navigation, and Layout Foundation

**Purpose:** Create the app frame before building screens.

---

## Required Work

- Implement AppShell.
- Implement protected route wrapper.
- Implement TopBar.
- Implement NotificationBell placeholder.
- Implement BottomNav per role.
- Implement `/profile` route shell.
- Implement role-based landing redirects.
- Implement mobile-first layout constraints.

---

## Forbidden / Guardrails

- Superadmin is not in public app shell.
- Bottom nav must exist for authenticated staff routes.
- Do not build isolated pages with their own navigation system.
- Touch targets minimum 44px.

---

## Completion Gate

- All protected routes render inside shared shell.
- Each role lands on correct route.
- Bottom nav appears where required.
- Mobile viewport checked.

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
