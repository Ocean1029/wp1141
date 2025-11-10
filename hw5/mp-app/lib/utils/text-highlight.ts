// Utility to highlight URLs in text for display

/**
 * Highlights URLs in text by wrapping them in HTML spans
 * This is used for displaying text with highlighted URLs in contentEditable divs
 */
export function highlightUrls(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  return text.replace(urlRegex, '<span class="text-blue-600">$1</span>');
}

/**
 * Extracts plain text from HTML content
 * Used to get the actual text value from contentEditable divs
 */
export function extractPlainText(html: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}

