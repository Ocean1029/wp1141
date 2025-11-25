/**
 * Logger utility
 * 
 * This module provides structured logging functionality for the application.
 * Replaces console.log/error with a proper logging system that supports
 * different log levels and structured output.
 * 
 * Features:
 * - Multiple log levels: debug, info, warn, error
 * - Structured JSON output in production
 * - Human-readable output in development
 * - Context support for additional metadata
 * - Automatic timestamp and log level inclusion
 */

import { config } from "@/config/env";

/**
 * Log levels enum
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

/**
 * Logger class
 * 
 * Provides structured logging with different log levels.
 * In development, outputs human-readable format.
 * In production, outputs JSON format for log aggregation systems.
 */
class Logger {
  private minLevel: LogLevel;

  constructor() {
    // Set minimum log level based on environment
    // In production, only log INFO and above
    // In development, log all levels including DEBUG
    this.minLevel = config.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  /**
   * Format log entry based on environment
   * 
   * @param entry - Log entry to format
   * @returns Formatted log string or object
   */
  private formatLog(entry: LogEntry): string | object {
    if (config.isProduction) {
      // JSON format for production (log aggregation systems)
      return JSON.stringify(entry);
    } else {
      // Human-readable format for development
      const timestamp = entry.timestamp;
      const level = entry.level.padEnd(5);
      const message = entry.message;
      const contextStr = entry.context
        ? ` ${JSON.stringify(entry.context)}`
        : "";
      const errorStr = entry.error
        ? `\n  Error: ${entry.error.message}${entry.error.stack ? `\n  Stack: ${entry.error.stack}` : ""}`
        : "";

      return `[${timestamp}] ${level} ${message}${contextStr}${errorStr}`;
    }
  }

  /**
   * Create log entry
   * 
   * @param level - Log level
   * @param message - Log message
   * @param context - Optional context data
   * @param error - Optional error object
   * @returns Log entry object
   */
  private createLogEntry(
    level: string,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    return entry;
  }

  /**
   * Log a message at the specified level
   * 
   * @param level - Log level
   * @param message - Log message
   * @param context - Optional context data
   * @param error - Optional error object
   */
  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (level < this.minLevel) {
      return; // Skip if below minimum log level
    }

    const entry = this.createLogEntry(levelName, message, context, error);
    const formatted = this.formatLog(entry);

    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  /**
   * Log debug message
   * 
   * Used for detailed debugging information that is typically
   * only of interest during development.
   * 
   * @param message - Debug message
   * @param context - Optional context data
   * 
   * @example
   *   logger.debug("Processing request", { userId: "123", endpoint: "/api/webhook" })
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, "DEBUG", message, context);
  }

  /**
   * Log info message
   * 
   * Used for general informational messages about application flow.
   * 
   * @param message - Info message
   * @param context - Optional context data
   * 
   * @example
   *   logger.info("User logged in", { userId: "123" })
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, "INFO", message, context);
  }

  /**
   * Log warning message
   * 
   * Used for potentially harmful situations that don't prevent
   * the application from functioning.
   * 
   * @param message - Warning message
   * @param context - Optional context data
   * 
   * @example
   *   logger.warn("Rate limit approaching", { userId: "123", requests: 95 })
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, "WARN", message, context);
  }

  /**
   * Log error message
   * 
   * Used for error events that might still allow the application
   * to continue running.
   * 
   * @param message - Error message
   * @param context - Optional context data
   * @param error - Optional error object
   * 
   * @example
   *   logger.error("API call failed", { endpoint: "/api/webhook" }, error)
   */
  error(
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    this.log(LogLevel.ERROR, "ERROR", message, context, error);
  }
}

/**
 * Singleton logger instance
 * 
 * Export a single logger instance to be used throughout the application.
 */
export const logger = new Logger();


