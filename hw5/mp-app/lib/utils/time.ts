// Time formatting utilities for relative timestamps

/**
 * Formats a date into a relative time string
 * Examples: "now", "5s", "2m", "1h", "3d", "Dec 15", "Dec 15, 2024"
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  // diffYears is calculated but not currently used in logic
  // const diffYears = Math.floor(diffDays / 365);

  // Less than 1 minute
  if (diffSeconds < 60) {
    return diffSeconds < 1 ? 'now' : `${diffSeconds}s`;
  }

  // Less than 1 hour
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  // Less than 1 day
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  // Less than 1 month
  if (diffDays < 30) {
    return `${diffDays}d`;
  }

  // Less than 1 year
  if (diffMonths < 12) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  }

  // More than 1 year
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

