# WHAT_EXISTS

## Implemented Routes

```txt
- Default Next.js App Router root route exists at app/page.tsx.
- No POgrid product routes have been implemented yet.
```

## Implemented Components

```txt
- shadcn/ui Button component exists at components/ui/button.tsx.
- No POgrid domain components have been implemented yet.
```

## Implemented Server Logic

```txt
- No POgrid server mutation logic has been implemented yet.
- Prisma config exists, but no business workflow logic exists.
- Prisma seed command is configured in prisma.config.ts.
```

## Implemented Database Models

```txt
- Prisma schema now defines Workspace, Department, User, Session, Client, ProductionOrder, Item, ItemProgress, Problem, Notification, and AuditLog.
- Item schema supports status pipeline, quantity/unit, required departments, drawing state, revision count, purchasing milestone, stage timestamps, rework/return lineage, flags, and item-level invoice status.
- AuditLog schema supports actor, action, entity reference, from/to JSON values, metadata JSON, and timestamp.
- Application-level invariants still need Phase 01B/server logic: DONE terminal behavior, progress non-decrease, append-only audit writes, role guards, and transaction sequencing.
```

## Implemented Tests

```txt
- No project tests have been implemented yet.
```

## Important Notes

```txt
- Phase 00A verified Node, npm, PostgreSQL presence, local database existence, and Prisma initialization.
- .env now has both DATABASE_URL and DIRECT_URL pointing to local pogrid_03 using PostgreSQL user postgres.
- Local database name confirmed by user: pogrid_03.
- Roadmap exists as docs/ROADMAP-2.md and has been aligned to the npm-only rule.
- Phase 00B created docs/AGENT_CONTEXT_SUMMARY.md for future implementation agents.
- No PRD logic, schema, or business UI was changed during Phase 00B.
- Phase 01A wrote and formatted prisma/schema.prisma only.
- Prisma migration check has been run manually and reported the database is already in sync.
- Prisma Client generation was confirmed done manually.
- No seed data has been created yet.
- Phase 01B added prisma/seed.ts with full workflow scenario coverage.
- package.json now has "db:seed": "tsx prisma/seed.ts".
- Migration 20260516063012_init_pogrid_schema has been created and applied.
- Seed execution succeeded.
- Seeded counts: 1 workspace, 7 departments, 12 users, 3 clients, 10 production orders, 15 items, 20 item progress rows, 6 problems, 6 notifications, and 11 audit logs.
```
