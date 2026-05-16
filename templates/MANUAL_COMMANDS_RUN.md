# MANUAL_COMMANDS_RUN

Record commands the user actually ran and results pasted back.

| Date | Command | Result Summary | Notes |
|---|---|---|---|
| 2026-05-16 | `node --version` | `v24.15.0` | Agent-run Phase 00A check. |
| 2026-05-16 | `npm --version` | `11.14.0` | Agent-run Phase 00A check. |
| 2026-05-16 | `psql --version` | PostgreSQL client 18.3 installed. | Agent-run Phase 00A check. |
| 2026-05-16 | `pg_isready` | Accepting connections on local PostgreSQL when checked outside sandbox. | Sandbox-local check reported no response, but escalated host check passed. |
| 2026-05-16 | `sudo pg_ctlcluster 18 main start` | Cluster already running. | Confirms PostgreSQL service exists and is running on host. |
| 2026-05-16 | `sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='pogrid_03';"` | Returned `1`. | Confirms actual local database name from user. |
| 2026-05-16 | `sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='pogrid_dev';"` | Returned `1`. | The originally listed database name also exists. |
| 2026-05-16 | `awk -F= '/^(DATABASE_URL|DIRECT_URL)=/ { print $1 }' .env` | Returned only `DATABASE_URL`. | `DIRECT_URL` is missing. Secret values were not recorded. |
| 2026-05-16 | `npx prisma --version` | Prisma CLI available, reports 7.8.0. | Prisma files are present. |
| 2026-05-16 | `npx prisma validate` | Schema is valid. | No business schema was created. |
| 2026-05-16 | `npx prisma db pull --print` | Failed with `P1001`, cannot reach localhost:51214. | Current `DATABASE_URL` does not point to the running local PostgreSQL database. |
| 2026-05-16 | `npx prisma migrate dev --name init_pogrid_schema` | Prisma connected to `pogrid_03` and reported: "Already in sync, no schema change or pending migration was found." | User-provided output after DATABASE_URL/DIRECT_URL were changed to postgres user. |
| 2026-05-16 | `npx prisma generate` | Done. | Confirmed by user. |
| 2026-05-16 | `npx prisma validate` | Schema is valid. | Agent-run after adding seed configuration. |
| 2026-05-16 | `npm ls tsx @prisma/client @prisma/adapter-pg pg` | Returned empty dependency tree. | Seed dependencies are missing. |
| 2026-05-16 | `npx prisma migrate dev --name init_pogrid_schema` | Created and applied migration `20260516063012_init_pogrid_schema`. | Agent-run after seed failed because tables did not exist. |
| 2026-05-16 | `npx prisma db seed` | Succeeded. | Had to run outside sandbox because `tsx` needs a local IPC pipe. |
| 2026-05-16 | `psql ... count query` | Verified seed counts across Workspace, Department, User, Client, ProductionOrder, Item, ItemProgress, Problem, Notification, and AuditLog. | Connection string omitted here to avoid repeating credentials in docs. |

## Commands User Must Run Manually

```bash
npx prisma studio
```

## Standard Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm test
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```
