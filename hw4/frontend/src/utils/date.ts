// Date utility functions

/**
 * Format ISO date string to local date
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Format ISO date string to local datetime
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get local timezone offset in hours
 */
export function getTimezoneOffset(): number {
  return -(new Date().getTimezoneOffset() / 60);
}

/**
 * Convert Date to ISO string for API
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

