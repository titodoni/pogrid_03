# MANUAL_COMMANDS_RUN

## Phase 3 Commands

### Install Packages
```bash
npm install @tanstack/react-query pusher pusher-js
```

### Lint Check
```bash
npm run lint
```
Result: No errors, no warnings.

### TypeScript Check
```bash
npx tsc --noEmit
```
Result: No errors.

### Production Build
```bash
npm run build
```
Result: Compiled successfully. All 20 routes generated.

## Required Environment Variables for Phase 3

Add these to `.env` for Pusher support:

```env
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

---

## Phase 2 Commands (Historical)

### Install shadcn/ui Components
```bash
npx shadcn@latest add card badge drawer sheet tabs avatar separator sonner skeleton
npx shadcn@latest add dropdown-menu dialog alert-dialog
```

### Install radix-ui Progress
```bash
npm install @radix-ui/react-progress
```

### Install Tech Stack Packages
```bash
npm install zod react-hook-form @hookform/resolvers bcryptjs date-fns sonner
npm install -D @types/bcryptjs prettier
```

### Seed Database (if reset needed)
```bash
npx prisma db seed
```

### Prettier Config
```bash
.prettierrc created with semi, singleQuote: false, tabWidth: 2, trailingComma: all, printWidth: 100
```

## MCP Tools Configured (opencode.json)

| Tool | Package | Purpose |
|------|---------|---------|
| context7 | `@upstash/context7-mcp` | Live docs lookup for libraries/frameworks |
| playwright | `@playwright/mcp` | Browser automation (disabled; enable for E2E tests) |
