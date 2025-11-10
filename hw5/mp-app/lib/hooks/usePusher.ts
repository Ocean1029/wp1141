"use client";

import { useEffect, useRef } from "react";
import Pusher from "pusher-js";

// Initialize Pusher client (singleton pattern)
let pusherClient: Pusher | null = null;

function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (pusherClient) {
    return pusherClient;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    if (typeof window !== "undefined" && !pusherClient) {
      // Only log once when first trying to initialize
      console.warn(
        "Pusher credentials not configured. Real-time features will be disabled. Set NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER environment variables to enable.",
      );
    }
    return null;
  }

  pusherClient = new Pusher(key, {
    cluster,
    authEndpoint: "/api/pusher/auth",
    auth: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  return pusherClient;
}

/**
 * Hook to subscribe to a Pusher channel and handle events
 * @param channelName - The name of the channel to subscribe to (null to unsubscribe)
 * @param eventHandlers - Object mapping event names to handler functions
 */
export function usePusherChannel(
  channelName: string | null,
  eventHandlers: Record<string, (data: unknown) => void>,
) {
  const channelRef = useRef<ReturnType<Pusher["subscribe"]> | null>(null);
  const handlersRef = useRef(eventHandlers);

  // Update handlers ref when eventHandlers change
  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    if (!channelName) {
      return;
    }

    const client = getPusherClient();
    if (!client) {
      return;
    }

    // Subscribe to channel
    const channel = client.subscribe(channelName);
    channelRef.current = channel;

    // Create wrapper functions that use the latest handlers
    const boundHandlers: Record<string, (data: unknown) => void> = {};
    Object.keys(eventHandlers).forEach((eventName) => {
      boundHandlers[eventName] = (data: unknown) => {
        handlersRef.current[eventName]?.(data);
      };
      channel.bind(eventName, boundHandlers[eventName]);
    });

    // Cleanup: unbind events and unsubscribe
    return () => {
      Object.keys(boundHandlers).forEach((eventName) => {
        channel.unbind(eventName, boundHandlers[eventName]);
      });
      client.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [channelName]); // Only re-subscribe when channelName changes
}

