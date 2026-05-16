# POgrid — Deployment and Environment Contract

> POgrid deploys as one isolated Vercel deployment per factory client, backed by a dedicated database. Commands use npm only.

## Deployment Model

- Single-tenant deployment per factory client.
- One Vercel project per client/workspace.
- One isolated PostgreSQL database per client/workspace.
- No cross-client data access.
- Public domain is allowed, but app remains internal through authentication and authorization.

## Runtime Stack

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Neon PostgreSQL hosted
- Vercel deployment
- Pusher realtime
- TanStack Query client cache
- Sonner local toast feedback
- Sentry monitoring optional but recommended

## Package Manager

Use npm only.

Allowed commands:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm test
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db seed
```

Forbidden: other package managers. Do not use pnpm or yarn commands.

## Required Environment Variables

```env
DATABASE_URL=
DIRECT_URL=
PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_KEY=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_CLUSTER=
SESSION_SECRET=
SUPERADMIN_BOOTSTRAP_PIN=
NEXT_PUBLIC_APP_URL=
SENTRY_DSN=
```

## Environment Variable Meaning

### `DATABASE_URL`

Primary Prisma database connection string.

Used by:

- App runtime
- Prisma Client

### `DIRECT_URL`

Direct database connection for migrations when required by hosted Postgres provider.

Used by:

- Prisma migrations

### `PUSHER_APP_ID`

Server-side Pusher app ID.

### `NEXT_PUBLIC_PUSHER_KEY`

Browser-safe Pusher public key.

### `PUSHER_SECRET`

Server-side Pusher secret.

Must never be exposed to browser.

### `NEXT_PUBLIC_PUSHER_CLUSTER`

Browser-safe Pusher cluster.

### `SESSION_SECRET`

Secret for signing/encrypting session data.

Must be strong and unique per deployment.

### `SUPERADMIN_BOOTSTRAP_PIN`

Initial setup PIN for Superadmin bootstrap.

Rules:

- Use only for initial setup/seed.
- Store hashed PIN in database.
- Do not expose in UI.

### `NEXT_PUBLIC_APP_URL`

Public app URL for links and environment-aware behavior.

### `SENTRY_DSN`

Optional error monitoring DSN.

## Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`.

3. Set local PostgreSQL or Neon development database URL.

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run migration:

```bash
npx prisma migrate dev
```

6. Seed database:

```bash
npx prisma db seed
```

7. Start dev server:

```bash
npm run dev
```

## Build Verification

Before deployment:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

A phase is not done if build fails.

## Vercel Deployment Setup

For each client/factory:

1. Create separate Vercel project.
2. Connect Git repository.
3. Set environment variables for that client only.
4. Connect dedicated Neon database.
5. Configure Pusher app credentials.
6. Run production migration:

```bash
npx prisma migrate deploy
```

7. Seed initial workspace if needed:

```bash
npx prisma db seed
```

8. Verify login and role routing.

## Neon Database Setup

Rules:

- One database/project per factory client.
- Do not share database between clients.
- Use pooled connection for runtime if recommended.
- Use direct connection for migrations if required.

## Pusher Setup

Rules:

- One Pusher app can be per client or environment depending deployment choice.
- Channel names must include workspace/client context.
- Server triggers events after database commit.
- Client subscribes only to authorized channels.
- Do not put full business objects in payload.

## Production Security Checks

Before public domain use:

- HTTPS enabled.
- Secure cookies enabled.
- Session secret set.
- Pusher secret not exposed.
- Database credentials not exposed.
- Superadmin hidden from public login.
- Role authorization enforced server-side.
- No debug routes exposed.
- No seed PINs exposed publicly.
- Error messages do not expose internals.

## Migration Rules

- Use Prisma migrations.
- Do not manually edit production database unless emergency and documented.
- Do not drop production data casually.
- Every schema change must respect PRD exclusions.
- No monetary fields.
- No upload fields.

## Seed Rules

Development seed is allowed.
Production seed must be deliberate.

Production bootstrap may create:

- Workspace
- Superadmin
- Initial Admin
- Initial departments

Production seed must not create fake client production data unless explicitly requested.

## Public Demo Deployment

`/demo` route:

- No login required.
- Uses hardcoded mock data.
- No database connection.
- Read-only.
- Simulates realtime client-side.
- Resets every 24 hours using time modulo logic.

## Rollback Notes

If deployment fails:

- Do not guess database fixes.
- Check Vercel build logs.
- Check environment variables.
- Check Prisma migration state.
- Check Pusher credentials.
- Check npm lockfile consistency.

## Forbidden Deployment Choices

- No Docker requirement for Vercel deployment.
- No shared database across clients.
- No multi-tenant workspace switching inside one deployment.
- No public client portal.
- No external workflow notifications.
- No pnpm commands.
