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

  const handleHashtagClick = (hashtag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Extract hashtag text (remove # and spaces)
    const tag = hashtag.trim().replace(/^#/, "");
    // Navigate to search or hashtag page (for now, just log)
    // In the future, this could navigate to a hashtag search page
    console.log("Hashtag clicked:", tag);
  };

  const handleUrlClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Sort segments by start position
  const sortedSegments = [...parsed.segments].sort((a, b) => a.start - b.start);
  
  const pushText = (content: string, keyPrefix: string) => {
    if (!content) {
      return;
    }
    const parts = content.split("\n");
    parts.forEach((part, index) => {
      if (part) {
        elements.push(
          <span key={`${keyPrefix}-text-${index}`}>{part}</span>
        );
      }
      if (index < parts.length - 1) {
        elements.push(<br key={`${keyPrefix}-br-${index}`} />);
      }
    });
  };

  // Build the rendered content
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedSegments.forEach((segment) => {
    // Add text before this segment
    if (segment.start > lastIndex) {
      const textBefore = text.substring(lastIndex, segment.start);
      pushText(textBefore, `before-${segment.start}`);
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
        <button
          key={`hashtag-${segment.start}`}
          onClick={(e) => handleHashtagClick(segment.content, e)}
          className="text-blue-600 hover:underline font-medium"
        >
          {segment.content}
        </button>
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
    pushText(textAfter, `after-${lastIndex}`);
  }

  return <p className={className}>{elements.length > 0 ? elements : text}</p>;
}

