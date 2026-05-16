# POgrid — Query Keys and Cache Contract

> TanStack Query must be used consistently so every task card, drawer, board item, PO detail, finance tab, and dashboard view stays synced.

## Rules

- PostgreSQL remains source of truth.
- TanStack Query stores client cache only.
- Pusher events invalidate/refetch queries; they do not replace database reads.
- Shared item views must use shared query keys.
- Do not create route-specific item truth.
- Avoid manual duplicated `useState` for server data.
- Use optimistic UI carefully only where PRD permits.

## Standard Query Keys

### Session and User

```ts
['session']
['currentUser']
['profile', userId]
```

Use for:

- Current session
- Current logged-in user
- Profile/PIN change UI

### Login

```ts
['loginDepartments']
['loginUsersByRole', roleKey]
```

Use for:

- Department/role icon list
- Active users under selected department/role

### Production Orders

```ts
['poList', filters]
['po', poId]
['poActivity', poId]
```

Use for:

- Admin PO list
- PO detail
- PO activity log

### Items

```ts
['item', itemId]
['itemProgress', itemId]
['itemProblems', itemId]
['itemAuditLog', itemId]
```

Use for:

- ItemTaskCard
- ItemDetailDrawer
- Progress snapshot
- Problem panel
- Activity log

### Tasks

```ts
['tasks', roleKey, filters]
['taskArchive', roleKey, month]
```

Use for:

- `/tasks` active tab
- `/tasks` archive tab
- Department-specific task list

### Board

```ts
['board', filters]
['boardItem', itemId]
```

Use for:

- Global floor view
- Stage columns/cards

### Notifications

```ts
['notifications', userId]
['notificationCount', userId]
```

Use for:

- Notification drawer
- Bell unread badge

### Finance

```ts
['finance', tab, filters]
['financeCounts', filters]
```

Use for:

- Pending/Invoiced/Paid tabs
- Summary counts

### Dashboard

```ts
['dashboard', period]
['dashboardKpis', period]
['dashboardCharts', period]
```

Use for:

- Analytics page
- KPI cards
- Charts
- Sticky summary bar

### Problems

```ts
['problems', filters]
['problem', problemId]
```

Use for:

- Admin problems center
- Problem detail/resolve sheet

### Settings

```ts
['settingsWorkspace']
['settingsUsers']
['settingsClients']
['settingsFlags']
['departments']
```

Use for:

- Admin settings tabs
- User management
- Client management
- Read-only flag thresholds

### Superadmin

```ts
['superadminWorkspaceConfig']
['superadminDepartments']
['superadminBilling']
```

Use only in `/superadmin`.

## Invalidation Rules by Event

### `PO_CREATED`

Invalidate:

```ts
['poList']
['board']
['dashboard']
['tasks']
['notifications']
['notificationCount']
```

### `PO_UPDATED`

Invalidate:

```ts
['po', poId]
['poList']
['board']
['dashboard']
```

### `PO_DELETED`

Invalidate:

```ts
['poList']
['board']
['dashboard']
['tasks']
```

Also close open views for deleted PO/item.

### `ITEM_PROGRESS_UPDATED`

Invalidate:

```ts
['item', itemId]
['itemProgress', itemId]
['tasks']
['board']
['po', poId]
['dashboard']
```

### `ITEM_STAGE_ADVANCED`

Invalidate:

```ts
['item', itemId]
['tasks']
['taskArchive']
['board']
['po', poId]
['dashboard']
['notifications']
['notificationCount']
```

### `ITEM_QC_PASSED`

Invalidate:

```ts
['item', itemId]
['tasks']
['board']
['po', poId]
['dashboard']
```

### `ITEM_QC_FAILED`

Invalidate:

```ts
['item', itemId]
['tasks']
['board']
['po', poId]
['dashboard']
['problems']
['notifications']
['notificationCount']
```

### `ITEM_REWORK_SPAWNED`

Invalidate:

```ts
['item', parentItemId]
['item', childItemId]
['tasks']
['board']
['po', poId]
['dashboard']
```

### `ITEM_DELIVERED`

Invalidate:

```ts
['item', itemId]
['tasks']
['taskArchive']
['board']
['po', poId]
['finance']
['financeCounts']
['dashboard']
['notifications']
['notificationCount']
```

### `ITEM_RETURN_SPAWNED`

Invalidate:

```ts
['item', parentItemId]
['item', childItemId]
['tasks']
['board']
['po', poId]
['finance']
['dashboard']
['notifications']
['notificationCount']
```

### `PROBLEM_REPORTED`

Invalidate:

```ts
['item', itemId]
['itemProblems', itemId]
['problems']
['board']
['po', poId]
['dashboard']
['notifications']
['notificationCount']
```

### `PROBLEM_RESOLVED`

Invalidate:

```ts
['item', itemId]
['itemProblems', itemId]
['problems']
['board']
['po', poId]
['dashboard']
```

### `INVOICE_STATUS_UPDATED`

Invalidate:

```ts
['item', itemId]
['finance']
['financeCounts']
['po', poId]
['dashboard']
['notifications']
['notificationCount']
```

### `NOTIFICATION_CREATED`

Invalidate:

```ts
['notifications', userId]
['notificationCount', userId]
```

## Opening Item Detail Drawer

When user opens item drawer/modal:

- Fetch `['item', itemId]` fresh.
- Do not rely only on task-card cached data.
- Show loading state if fresh data is loading.
- If item was changed by another user, display latest server state.

## Progress Mutation Cache Behavior

For normal progress update:

1. User changes local control value.
2. Sonner 5-second undo appears.
3. No server mutation yet.
4. If undo tapped: discard local pending value.
5. If timer expires: call mutation.
6. On mutation success: invalidate affected queries.
7. Pusher event will also invalidate remote clients.

Do not write optimistic data to global cache before the undo window unless implementation carefully isolates pending local state.

## Shared Component Rule

These components must consume shared item query data or receive data derived from shared queries:

- `ItemTaskCard`
- `ItemDetailDrawer`
- `ProgressSnapshot`
- `DepartmentProgressRow`
- `RoleActionPanel`
- `FinanceItemRow`
- `BoardItemCard`

Forbidden:

- Separate item state per route.
- Modal-only item truth.
- Board-only item truth.
- Finance-only item truth.

## Offline / Reconnect Behavior

When realtime disconnects:

- Show subtle disconnected state.
- Allow read-only browsing from cached data.
- Mutations should fail safely or queue only if explicitly implemented.
- On reconnect, refetch visible critical queries.

Critical refetch on reconnect:

```ts
['session']
['tasks']
['board']
['notifications']
['notificationCount']
['item', openItemId]
['po', openPoId]
```
