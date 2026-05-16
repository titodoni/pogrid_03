import Pusher from "pusher";
import {
  PUSHER_CHANNELS,
  type PusherEventName,
  type PusherBasePayload,
  type PusherPOEventPayload,
  type PusherItemEventPayload,
  type PusherStageAdvancedPayload,
  type PusherQCFailedPayload,
  type PusherReworkSpawnedPayload,
  type PusherProblemPayload,
  type PusherNotificationPayload,
} from "./events";

type PusherPayloadMap = {
  PO_CREATED: PusherPOEventPayload;
  PO_UPDATED: PusherPOEventPayload;
  PO_DELETED: PusherPOEventPayload;
  ITEM_PROGRESS_UPDATED: PusherItemEventPayload;
  ITEM_STAGE_ADVANCED: PusherStageAdvancedPayload;
  ITEM_QC_PASSED: PusherItemEventPayload;
  ITEM_QC_FAILED: PusherQCFailedPayload;
  ITEM_DELIVERED: PusherItemEventPayload;
  ITEM_RETURN_SPAWNED: PusherReworkSpawnedPayload;
  PROBLEM_REPORTED: PusherProblemPayload;
  PROBLEM_RESOLVED: PusherProblemPayload;
  INVOICE_STATUS_UPDATED: PusherItemEventPayload;
  NOTIFICATION_CREATED: PusherNotificationPayload;
};

function createPusherClient(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}

let pusherClient: Pusher | null = null;

function getPusher(): Pusher {
  if (!pusherClient) {
    pusherClient = createPusherClient();
  }
  if (!pusherClient) {
    throw new Error("Pusher not configured. Set PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER.");
  }
  return pusherClient;
}

function getBasePayload(workspaceId: string): PusherBasePayload {
  return {
    workspaceId,
    changedAt: new Date().toISOString(),
  };
}

export async function broadcastEvent<E extends PusherEventName>(
  event: E,
  payload: PusherPayloadMap[E],
): Promise<void> {
  const channels = getChannelsForEvent(event, payload);

  try {
    const pusher = getPusher();
    await Promise.all(
      channels.map((channel) => pusher.trigger(channel, event, payload)),
    );
  } catch (error) {
    console.error(`Pusher broadcast failed for ${event}:`, error);
  }
}

function getChannelsForEvent(
  event: PusherEventName,
  payload: PusherBasePayload,
): string[] {
  const channels: string[] = [];

  channels.push(PUSHER_CHANNELS.WORKSPACE(payload.workspaceId));

  if ("poId" in payload && payload.poId) {
    channels.push(PUSHER_CHANNELS.PO(payload.poId));
  }

  if ("itemId" in payload && payload.itemId) {
    channels.push(PUSHER_CHANNELS.ITEM(payload.itemId));
  }

  if ("roleTarget" in payload && payload.roleTarget) {
    channels.push(PUSHER_CHANNELS.ROLE(payload.workspaceId, payload.roleTarget!));
  }

  if ("userTarget" in payload && payload.userTarget) {
    channels.push(PUSHER_CHANNELS.USER(payload.userTarget!));
  }

  return channels;
}

export { getBasePayload };
