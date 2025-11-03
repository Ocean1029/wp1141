// Text parsing utilities for posts (URL, Hashtag, Mention handling)

export interface TextSegment {
  type: 'text' | 'url' | 'hashtag' | 'mention';
  content: string;
  start: number;
  end: number;
}

export interface ParsedText {
  segments: TextSegment[];
  charCount: number;
}

/**
 * Parses text content and calculates character count according to platform rules:
 * - URLs count as 23 characters
 * - Hashtags and Mentions don't count
 * - Regular text counts normally (up to 280 max)
 */
export function parseText(input: string): ParsedText {
  const segments: TextSegment[] = [];
  let charCount = 0;
  
  // Set to track processed character indices
  const processedIndices = new Set<number>();

  // 1. Find and mark URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  let match;
  while ((match = urlRegex.exec(input)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    
    segments.push({
      type: 'url',
      content: match[0],
      start,
      end,
    });
    
    for (let i = start; i < end; i++) {
      processedIndices.add(i);
    }
    
    charCount += 23; // URL counts as 23 chars
  }

  // 2. Find and mark Hashtags
  const hashtagRegex = /(^|\s)#([a-z0-9_]+)/gi;
  while ((match = hashtagRegex.exec(input)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    
    segments.push({
      type: 'hashtag',
      content: match[0],
      start,
      end,
    });
    
    for (let i = start; i < end; i++) {
      processedIndices.add(i);
    }
    
    // Hashtags don't count towards character limit
  }

  // 3. Find and mark Mentions (@userId)
  const mentionRegex = /@([a-z0-9](?:_?[a-z0-9]){2,19})\b/g;
  while ((match = mentionRegex.exec(input)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    
    segments.push({
      type: 'mention',
      content: match[0],
      start,
      end,
    });
    
    for (let i = start; i < end; i++) {
      processedIndices.add(i);
    }
    
    // Mentions don't count towards character limit
  }

  // 4. Count regular text
  for (let i = 0; i < input.length; i++) {
    if (!processedIndices.has(i)) {
      charCount++;
    }
  }

  return { segments, charCount };
}

/**
 * Validates if text content meets the 280 character limit
 */
export function validateTextLength(input: string): { valid: boolean; charCount: number } {
  const parsed = parseText(input);
  return {
    valid: parsed.charCount <= 280,
    charCount: parsed.charCount,
  };
}

