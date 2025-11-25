/**
 * Message loader and management system
 * 
 * This module provides utilities for loading and managing bot messages.
 * Messages are externalized from code and can be accessed via dot-notation paths.
 * 
 * Usage:
 *   const message = getMessage('events.follow.welcome');
 *   const paramMessage = getMessage('events.message.echo', { message: 'Hello' });
 */

import { messages } from "./messages";
import type { MessageKey, MessageParams, MessageTemplate } from "./types";

/**
 * Get a message by key path
 * 
 * Retrieves a message from the message structure using dot-notation.
 * Supports parameterized messages with template replacement.
 * 
 * @param key - Dot-separated path to the message (e.g., 'events.follow.welcome')
 * @param params - Optional parameters for template replacement
 * @returns The resolved message string
 * @throws Error if the message key is not found
 * 
 * @example
 *   getMessage('events.follow.welcome')
 *   // Returns: "Welcome! I'm your LINE Bot assistant..."
 * 
 * @example
 *   getMessage('events.message.echo', { message: 'Hello' })
 *   // Returns: "You said: Hello"
 */
export function getMessage(key: MessageKey, params?: MessageParams): string {
  const keys = key.split(".");
  let current: any = messages;

  // Navigate through the nested structure
  for (const k of keys) {
    if (current === undefined || current === null) {
      throw new Error(`Message key not found: ${key} (failed at: ${k})`);
    }
    current = current[k];
  }

  // Handle message template
  if (typeof current === "string") {
    return replaceParams(current, params);
  } else if (typeof current === "function") {
    return current(params);
  } else {
    throw new Error(`Message key not found or invalid type: ${key}`);
  }
}

/**
 * Replace parameters in a message template
 * 
 * Replaces {paramName} placeholders with actual values from params.
 * 
 * @param template - Message template with {paramName} placeholders
 * @param params - Parameters to replace in the template
 * @returns Message with parameters replaced
 * 
 * @example
 *   replaceParams("Hello, {name}!", { name: "John" })
 *   // Returns: "Hello, John!"
 */
function replaceParams(template: string, params?: MessageParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, paramName) => {
    const value = params[paramName];
    if (value === undefined || value === null) {
      return match; // Keep original placeholder if param not found
    }
    return String(value);
  });
}

/**
 * Check if a message key exists
 * 
 * @param key - Dot-separated path to the message
 * @returns True if the message exists, false otherwise
 */
export function hasMessage(key: MessageKey): boolean {
  try {
    getMessage(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all available message keys
 * 
 * Recursively traverses the message structure and returns all valid keys.
 * 
 * @param prefix - Optional prefix for nested keys
 * @param obj - Optional object to traverse (defaults to messages)
 * @returns Array of all available message keys
 */
export function getAllMessageKeys(
  prefix = "",
  obj: any = messages
): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === "string" || typeof value === "function") {
      keys.push(currentKey);
    } else if (typeof value === "object" && value !== null) {
      keys.push(...getAllMessageKeys(currentKey, value));
    }
  }

  return keys;
}

/**
 * Export messages for direct access if needed
 */
export { messages };


