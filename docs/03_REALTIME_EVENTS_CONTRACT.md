# POgrid — Realtime Events Contract

> Pusher is the realtime event layer. It never replaces PostgreSQL and never sends full business objects.

## Core Rules

- PostgreSQL is the source of truth.
- Server commits database transaction first.
- AuditLog and Notification rows are created before realtime broadcast when required.
- Pusher broadcasts only after successful commit.
- Pusher payloads contain IDs and metadata only.
- Clients use event payloads to invalidate/refetch TanStack Query data.
- Pusher must not be used for permanent notification storage.
- Sonner must not be used as realtime infrastructure.

## Channel Strategy

### `workspace:{workspaceId}`

Use for broad board/dashboard invalidation.

Events:

- PO created/updated/deleted
- Urgency changes
- Global board changes
- Problem reported/resolved

### `po:{poId}`

Use for PO detail screens.

Events:

- PO header updated
- Item in PO changed
- Item stage advanced
- PO deleted

### `item:{itemId}`

Use for open item detail drawer/modal.

Events:

- Progress updated
- QC decision
- Delivery confirmation
- Invoice update
- Problem update

### `role:{workspaceId}:{roleKey}`

Use for role-targeted queue refresh and notification badge refresh.

Events:

- New task enters role queue
- Notification created for role

### `user:{userId}`

Use for user-specific notification read/unread state.

Events:

- Notification created for user
- Notification read state changed

## Standard Payload Shape

Every event payload should follow this shape where possible:

```ts
{
  workspaceId: string
  poId?: string
  itemId?: string
  problemId?: string
  notificationId?: string
  roleTarget?: string
  actorUserId?: string
  changedAt: string
}
```

Do not include:

- Full PO object
- Full Item object
- Full User object
- Full Notification list
- Full AuditLog list
- Monetary fields
- Attachment fields

## Event Names

### `PO_CREATED`

When:

- Admin creates a new PO.

Payload:

```ts
{
  workspaceId: string
  poId: string
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- `['poList']`
- `['board']`
- `['dashboard']`
- Role task queries for relevant departments
- Notification queries for targeted roles

### `PO_UPDATED`

When:

- Admin edits PO header fields.
- Admin manually escalates urgency.

Payload:

```ts
{
  workspaceId: string
  poId: string
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- `['po', poId]`
- `['poList']`
- `['board']`
- `['dashboard']`

### `PO_DELETED`

When:

- Admin deletes eligible PO after PIN confirmation.

Payload:

```ts
{
  workspaceId: string
  poId: string
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- `['poList']`
- `['board']`
- `['dashboard']`
- Close open PO/item views if affected

### `ITEM_PROGRESS_UPDATED`

When:

- Production, Purchasing, or other progress value commits after undo window.

Payload:

```ts
{
  workspaceId: string
  poId: string
  itemId: string
  departmentId?: string
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- `['item', itemId]`
- `['tasks']`
- `['board']`
- `['po', poId]`
- `['dashboard']`

### `ITEM_STAGE_ADVANCED`

When:

- Item enters a new stage.

Payload:

```ts
{
  workspaceId: string
  poId: string
  itemId: string
  fromStage: string
  toStage: string
  actorUserId?: string
  changedAt: string
}
```

Client invalidation:

- `['item', itemId]`
- `['tasks']`
- `['board']`
- `['po', poId]`
- `['dashboard']`
- Target next-stage role task queries

### `ITEM_QC_PASSED`

When:

- QC marks item as pass.

Payload:

```ts
{
  workspaceId: string
  poId: string
  itemId: string
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- Item, tasks, board, PO detail, delivery queue

### `ITEM_QC_FAILED`

When:

- QC marks minor or major defect.

Payload:

```ts
{
  workspaceId: string
  poId: string
  itemId: string
  failureType: 'MINOR' | 'MAJOR'
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- `['item', itemId]`
- `['tasks']`
- `['board']`
- `['po', poId]`
- `['dashboard']`
- `['notifications']`

### `ITEM_REWORK_SPAWNED`

When:

- QC major fail creates a child item.

Payload:

```ts
{
  workspaceId: string
  poId: string
  parentItemId: string
  childItemId: string
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- `['item', parentItemId]`
- `['item', childItemId]`
- `['tasks']`
- `['board']`
- `['po', poId]`
- `['dashboard']`

### `ITEM_DELIVERED`

When:

- Delivery confirms shipment and item becomes DONE.

Payload:

```ts
{
  workspaceId: string
  poId: string
  itemId: string
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- `['item', itemId]`
- `['tasks']`
- `['board']`
- `['po', poId]`
- `['finance']`
- `['dashboard']`
- `['notifications']`

### `ITEM_RETURN_SPAWNED`

When:

- Delivery triggers a client return from a DONE item.

Payload:

```ts
{
  workspaceId: string
  poId: string
  parentItemId: string
  childItemId: string
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- `['item', parentItemId]`
- `['item', childItemId]`
- `['tasks']`
- `['board']`
- `['po', poId]`
- `['finance']`
- `['dashboard']`

### `PROBLEM_REPORTED`

When:

- User or system creates a problem.

Payload:

```ts
{
  workspaceId: string
  poId: string
  itemId: string
  problemId: string
  actorUserId?: string
  changedAt: string
}
```

Client invalidation:

- `['item', itemId]`
- `['problems']`
- `['board']`
- `['po', poId]`
- `['dashboard']`
- `['notifications']`

### `PROBLEM_RESOLVED`

When:

- A problem is resolved manually or system auto-resolves it.

Payload:

```ts
{
  workspaceId: string
  poId: string
  itemId: string
  problemId: string
  actorUserId?: string
  changedAt: string
}
```

Client invalidation:

- `['item', itemId]`
- `['problems']`
- `['board']`
- `['po', poId]`
- `['dashboard']`

### `INVOICE_STATUS_UPDATED`

When:

- Finance changes item invoice state.

Payload:

```ts
{
  workspaceId: string
  poId: string
  itemId: string
  actorUserId: string
  changedAt: string
}
```

Client invalidation:

- `['item', itemId]`
- `['finance']`
- `['po', poId]`
- `['dashboard']`

### `NOTIFICATION_CREATED`

When:

- Notification row is inserted.

Payload:

```ts
{
  workspaceId: string
  notificationId: string
  targetUserId?: string
  targetRoleKey?: string
  poId?: string
  itemId?: string
  changedAt: string
}
```

Client invalidation:

- `['notifications']`
- `['notificationCount']`

## Broadcast Timing Rules

### Progress with Undo

Correct:

```txt
User taps progress
Sonner shows 5-second Undo
No server write yet
If not undone → server mutation commits
AuditLog written
Notifications created if needed
Pusher broadcasts
Clients invalidate/refetch
```

Wrong:

```txt
Server writes immediately
Pusher broadcasts immediately
Undo attempts rollback
```

## Reconnection Rules

When Pusher reconnects after disconnect:

- Do not trust missed events.
- Refetch critical visible queries.
- Refetch notification count.
- Refetch open item drawer if present.

## Forbidden Use

- Do not use Pusher to send full item data.
- Do not use Pusher as a database.
- Do not rely on Pusher for audit history.
- Do not rely on Pusher for notification persistence.
- Do not emit events before commit.
