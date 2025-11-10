import Pusher from "pusher";

// Check if Pusher credentials are configured
const hasPusherConfig =
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER;

// Server-side Pusher instance (optional)
export const pusher = hasPusherConfig
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    })
  : null;

// Log warning if Pusher is not configured
if (!hasPusherConfig && typeof window === "undefined") {
  console.warn(
    "Pusher is not configured. Real-time features will be disabled. Set PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, and PUSHER_CLUSTER environment variables to enable.",
  );
}

