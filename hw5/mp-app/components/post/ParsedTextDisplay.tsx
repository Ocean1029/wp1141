"use client";

import { useRouter } from "next/navigation";
import { parseText } from "@/lib/utils/text-parser";

interface ParsedTextDisplayProps {
  text: string;
  className?: string;
}

export function ParsedTextDisplay({ text, className = "" }: ParsedTextDisplayProps) {
  const router = useRouter();
  const parsed = parseText(text);

  const handleMentionClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${userId}`);
  };

  const handleUrlClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Sort segments by start position
  const sortedSegments = [...parsed.segments].sort((a, b) => a.start - b.start);
  
  // Build the rendered content
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedSegments.forEach((segment) => {
    // Add text before this segment
    if (segment.start > lastIndex) {
      const textBefore = text.substring(lastIndex, segment.start);
      if (textBefore) {
        elements.push(<span key={`text-${lastIndex}`}>{textBefore}</span>);
      }
    }

    // Add the segment
    if (segment.type === "mention") {
      const userId = segment.content.substring(1); // Remove @
      elements.push(
        <button
          key={`mention-${segment.start}`}
          onClick={(e) => handleMentionClick(userId, e)}
          className="text-blue-600 hover:underline font-medium"
        >
          {segment.content}
        </button>
      );
    } else if (segment.type === "hashtag") {
      elements.push(
        <span key={`hashtag-${segment.start}`} className="text-blue-600 font-medium">
          {segment.content}
        </span>
      );
    } else if (segment.type === "url") {
      elements.push(
        <button
          key={`url-${segment.start}`}
          onClick={(e) => handleUrlClick(segment.content, e)}
          className="text-blue-600 hover:underline break-all"
        >
          {segment.content}
        </button>
      );
    } else {
      elements.push(
        <span key={`text-${segment.start}`}>{segment.content}</span>
      );
    }

    lastIndex = segment.end;
  });

  // Add remaining text after last segment
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex);
    if (textAfter) {
      elements.push(<span key={`text-${lastIndex}`}>{textAfter}</span>);
    }
  }

  return <p className={className}>{elements.length > 0 ? elements : text}</p>;
}

