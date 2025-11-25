/**
 * Message system type definitions
 * 
 * This module defines types for the message management system,
 * which allows externalizing all bot messages from code.
 */

/**
 * Message parameters for template replacement
 * 
 * Used to replace placeholders in message templates.
 * Example: "Hello, {name}!" with params { name: "John" } becomes "Hello, John!"
 */
export type MessageParams = Record<string, string | number | boolean>;

/**
 * Message template with optional parameters
 * 
 * Can be either a plain string or a function that takes parameters
 * and returns a string.
 */
export type MessageTemplate = string | ((params?: MessageParams) => string);

/**
 * Message structure organized by categories
 * 
 * Messages are organized hierarchically for easy management:
 * - events: Event-based messages (follow, message, etc.)
 * - errors: Error messages
 * - states: State machine messages
 * - common: Common/reusable messages
 */
export interface MessageStructure {
  events: {
    follow: {
      welcome: MessageTemplate;
    };
    message: {
      echo: MessageTemplate;
      processing: MessageTemplate;
    };
    unfollow: {
      goodbye: MessageTemplate;
    };
  };
  errors: {
    generic: MessageTemplate;
    openai: {
      failed: MessageTemplate;
      timeout: MessageTemplate;
    };
    line: {
      apiError: MessageTemplate;
      invalidRequest: MessageTemplate;
    };
  };
  states: {
    [key: string]: {
      [key: string]: MessageTemplate;
    };
  };
}

/**
 * Message key path type
 * 
 * Represents a dot-separated path to a message in the structure.
 * Example: "events.follow.welcome"
 */
export type MessageKey = string;

