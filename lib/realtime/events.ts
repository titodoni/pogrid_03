export const PUSHER_EVENTS = {
  PO_CREATED: "PO_CREATED",
  PO_UPDATED: "PO_UPDATED",
  PO_DELETED: "PO_DELETED",
  ITEM_PROGRESS_UPDATED: "ITEM_PROGRESS_UPDATED",
  ITEM_STAGE_ADVANCED: "ITEM_STAGE_ADVANCED",
  ITEM_QC_PASSED: "ITEM_QC_PASSED",
  ITEM_QC_FAILED: "ITEM_QC_FAILED",
  ITEM_DELIVERED: "ITEM_DELIVERED",
  ITEM_RETURN_SPAWNED: "ITEM_RETURN_SPAWNED",
  PROBLEM_REPORTED: "PROBLEM_REPORTED",
  PROBLEM_RESOLVED: "PROBLEM_RESOLVED",
  INVOICE_STATUS_UPDATED: "INVOICE_STATUS_UPDATED",
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
} as const;

export type PusherEventName = (typeof PUSHER_EVENTS)[keyof typeof PUSHER_EVENTS];

export type PusherBasePayload = {
  workspaceId: string;
  poId?: string;
  itemId?: string;
  roleTarget?: string;
  userTarget?: string;
  changedAt: string;
};

export type PusherPOEventPayload = PusherBasePayload & {
  poId: string;
};

export type PusherItemEventPayload = PusherBasePayload & {
  poId: string;
  itemId: string;
};

export type PusherStageAdvancedPayload = PusherItemEventPayload & {
  fromStage: string;
  toStage: string;
  actorUserId?: string;
};

export type PusherQCFailedPayload = PusherItemEventPayload & {
  failureType: "MINOR" | "MAJOR";
  actorUserId: string;
};

export type PusherReworkSpawnedPayload = PusherBasePayload & {
  poId: string;
  parentItemId: string;
  childItemId: string;
  actorUserId: string;
};

export type PusherProblemPayload = PusherBasePayload & {
  poId: string;
  itemId: string;
  problemId: string;
  actorUserId?: string;
};

export type PusherNotificationPayload = PusherBasePayload & {
  notificationId: string;
  targetUserId?: string;
  targetRoleKey?: string;
  poId?: string;
  itemId?: string;
};

export const PUSHER_CHANNELS = {
  WORKSPACE: (workspaceId: string) => `workspace:${workspaceId}`,
  PO: (poId: string) => `po:${poId}`,
  ITEM: (itemId: string) => `item:${itemId}`,
  ROLE: (workspaceId: string, roleKey: string) => `role:${workspaceId}:${roleKey}`,
  USER: (userId: string) => `user:${userId}`,
} as const;
