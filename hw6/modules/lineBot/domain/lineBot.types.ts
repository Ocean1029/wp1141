/**
 * LINE Bot domain types
 * 
 * Type definitions for LINE Bot events and messages
 */

import type { WebhookEvent, MessageEvent, FollowEvent, UnfollowEvent } from "@line/bot-sdk";

/**
 * Extended LINE event types
 */
export type LineEvent = WebhookEvent;

/**
 * Message event type guard
 */
export function isMessageEvent(event: WebhookEvent): event is MessageEvent {
  return event.type === "message";
}

/**
 * Follow event type guard
 */
export function isFollowEvent(event: WebhookEvent): event is FollowEvent {
  return event.type === "follow";
}

/**
 * Unfollow event type guard
 */
export function isUnfollowEvent(event: WebhookEvent): event is UnfollowEvent {
  return event.type === "unfollow";
}

/**
 * Text message event type guard
 */
export function isTextMessage(event: MessageEvent): boolean {
  return event.message.type === "text";
}

/**
 * Context object for handling LINE events
 */
export interface LineBotContext {
  event: WebhookEvent;
  replyToken?: string;
  userId?: string;
  groupId?: string;
  roomId?: string;
}

