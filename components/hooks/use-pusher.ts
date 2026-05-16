"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateByEvent } from "@/lib/queries/invalidation-map";

type PusherHookOptions = {
  workspaceId?: string;
  poId?: string;
  itemId?: string;
  userId?: string;
  roleKey?: string;
  enabled?: boolean;
};

export function usePusherChannel(options: PusherHookOptions) {
  const queryClient = useQueryClient();
  const pusherRef = useRef<{ disconnect: () => void } | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = useCallback(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !options.enabled) return;

    import("pusher-js").then((PusherModule) => {
      const PusherClient = PusherModule.default;
      const pusher = new PusherClient(key, {
        cluster: cluster ?? "ap1",
        forceTLS: true,
      });

      const channels: string[] = [];

      if (options.workspaceId) {
        channels.push(`workspace:${options.workspaceId}`);
      }
      if (options.poId) {
        channels.push(`po:${options.poId}`);
      }
      if (options.itemId) {
        channels.push(`item:${options.itemId}`);
      }
      if (options.userId) {
        channels.push(`user:${options.userId}`);
      }
      if (options.workspaceId && options.roleKey) {
        channels.push(`role:${options.workspaceId}:${options.roleKey}`);
      }

      for (const channelName of channels) {
        const channel = pusher.subscribe(channelName);
        channel.bind_global((event: string, data: Record<string, unknown>) => {
          invalidateByEvent(queryClient, event, data);
        });
      }

      pusherRef.current = pusher;
      setSubscribed(true);
    });
  }, [options.workspaceId, options.poId, options.itemId, options.userId, options.roleKey, options.enabled, queryClient]);

  useEffect(() => {
    subscribe();

    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
        setSubscribed(false);
      }
    };
  }, [subscribe]);

  return { subscribed };
}
