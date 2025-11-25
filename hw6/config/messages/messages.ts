/**
 * LINE Bot message definitions
 * 
 * This file contains all message templates used by the LINE Bot.
 * Messages are organized by category and can include parameters for
 * dynamic content replacement.
 * 
 * To add new messages:
 * 1. Add the message to the appropriate category in the messages object
 * 2. Use {paramName} syntax for parameterized messages
 * 3. Update the MessageStructure type in types.ts if adding new categories
 */

import type { MessageStructure } from "./types";

/**
 * All bot messages organized by category
 * 
 * Messages use template syntax with {paramName} for dynamic values.
 * The MessageLoader will replace these placeholders with actual values.
 */
export const messages: MessageStructure = {
  events: {
    follow: {
      welcome: "Welcome! I'm your LINE Bot assistant. How can I help you today?",
    },
    message: {
      echo: (params) => `You said: ${params?.message || ""}`,
      processing: "Processing your message, please wait...",
    },
    unfollow: {
      goodbye: "Thank you for using our service. Goodbye!",
    },
  },
  errors: {
    generic: "An error occurred. Please try again later.",
    openai: {
      failed: "Sorry, I couldn't generate a response. Please try again.",
      timeout: "The request took too long. Please try again.",
    },
    line: {
      apiError: "An error occurred while processing your request.",
      invalidRequest: "Invalid request. Please check your input.",
    },
  },
  states: {
    // State machine messages can be added here
    // Example:
    // initial: {
    //   prompt: "Please select an option:",
    //   invalid: "Invalid option. Please try again.",
    // },
  },
};
    
