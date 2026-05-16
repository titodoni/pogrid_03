# Phase 0A — Local Environment and PostgreSQL Verification

**Purpose:** Prove the development machine can run POgrid locally before coding.

---

## Required Work

- Confirm Node.js and npm are installed.
- Install PostgreSQL locally, not Docker.
- Start PostgreSQL service.
- Create `pogrid_dev` database.
- Create `.env` with `DATABASE_URL` and `DIRECT_URL`.
- Verify Prisma can connect after Prisma is installed.
- Do not start schema/auth/seed work before DB connection is verified.

---

## Forbidden / Guardrails

- Use npm only.
- Docker must not be required.
- Do not run migrations until Prisma schema exists.
- Do not use hosted Neon for local-only verification unless local PostgreSQL is impossible and documented.

---

## Completion Gate

- `postgresql` service running.
- `pogrid_dev` database exists.
- `.env` exists locally.
- Manual command results recorded in `MANUAL_COMMANDS_RUN.md`.

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
