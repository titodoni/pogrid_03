# KNOWN_ISSUES

## Open Issues

| ID | Severity | Area | Description | Status |
|---|---|---|---|---|
| ENV-001 | Low | Local database | `.env` has `DATABASE_URL` and `DIRECT_URL` pointing to local `pogrid_03` as PostgreSQL user `postgres`. Prisma connects to `localhost:5432`. | Resolved |
| DB-001 | Medium | Prisma | Phase 01A schema is formatted; migration check reported the database is already in sync and Prisma Client generation was confirmed done manually. | Resolved |
| DEV-001 | High | Dependencies | Phase 01B seed dependencies are installed. | Resolved |
| SEED-001 | Medium | Seed | `npx prisma db seed` succeeded and sample records were verified. | Resolved |

## Deferred Decisions

```txt
- 
```

## Do Not Forget

```txt
- Use npm only.
- Do not continue to Phase 02A unless explicitly requested.
```
