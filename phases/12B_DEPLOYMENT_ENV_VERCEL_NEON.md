# Phase 12B — Deployment Environment and Vercel/Neon Setup

**Purpose:** Prepare single-tenant deployment per factory client.

---

## Required Work

- Create Neon production database.
- Set Vercel environment variables.
- Configure Pusher production app.
- Run Prisma migration.
- Seed production starter data only when intended.
- Configure custom domain if needed.
- Run production build.
- Verify deployed routes and auth.

---

## Forbidden / Guardrails

- One independent deployment per factory client.
- No cross-client data sharing.
- Do not use local DATABASE_URL in production.
- Do not expose env secrets.

---

## Completion Gate

- Vercel deployment succeeds.
- Production DB connected.
- Login works.
- Realtime works.
- Seed/admin bootstrap documented.

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
