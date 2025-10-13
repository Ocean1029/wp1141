// Text processing utilities

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Extract preview text from content (first N characters or first paragraph)
 */
export function getPreviewText(
  content: string,
  maxLength: number = 200
): string {
  // Remove extra whitespace and newlines
  const cleaned = content.trim().replace(/\s+/g, ' ');
  return truncateText(cleaned, maxLength);
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Highlight search query in text
 */
export function highlightText(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

