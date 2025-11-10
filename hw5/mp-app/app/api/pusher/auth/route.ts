import { auth } from "@/lib/auth";
import { pusher } from "@/lib/pusher";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // If Pusher is not configured, return error
  if (!pusher) {
    return new Response("Pusher is not configured", { status: 503 });
  }

  const { socket_id, channel_name } = await req.json();

  const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
    user_id: session.user.id,
  });

  return Response.json(authResponse);
}

