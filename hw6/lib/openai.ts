import OpenAI from "openai";
import { config } from "@/config/env";

/**
 * OpenAI client instance
 * 
 * Singleton pattern to reuse the same client instance across the application.
 * Configured with API key and optional organization ID from environment variables.
 */
export const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  organization: config.openai.orgId,
});

/**
 * Default OpenAI model to use
 */
export const DEFAULT_MODEL = config.openai.model;

/**
 * Helper function to create a chat completion
 * 
 * @param messages - Array of chat messages
 * @param options - Optional parameters for the completion
 * @returns Promise resolving to the chat completion response
 */
export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  return await openai.chat.completions.create({
    model: options?.model || DEFAULT_MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens,
  });
}

/**
 * Helper function to create a text completion (legacy API)
 * 
 * @param prompt - Text prompt for completion
 * @param options - Optional parameters for the completion
 * @returns Promise resolving to the completion response
 */
export async function createCompletion(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  return await openai.completions.create({
    model: options?.model || "gpt-4o",
    prompt,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens,
  });
}

