"use client";

import { useState, useEffect, useRef } from "react";
import { searchUsers } from "@/lib/server/users";

interface User {
  id: string;
  userId: string;
  name: string;
  imageUrl?: string;
}

interface AutocompleteState {
  type: "mention" | "hashtag" | null;
  query: string;
  position: { top: number; left: number } | null;
  selectedIndex: number;
}

interface AutocompleteProps {
  text: string;
  cursorPosition: number;
  textareaElement: HTMLDivElement | null;
  onSelect: (text: string, insertText: string) => void;
}

export function useAutocomplete({
  text,
  cursorPosition,
  textareaElement,
  onSelect,
}: AutocompleteProps) {
  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    type: null,
    query: "",
    position: null,
    selectedIndex: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect @ or # trigger
  useEffect(() => {
    if (!textareaElement || cursorPosition === 0) {
      setAutocomplete({ type: null, query: "", position: null, selectedIndex: 0 });
      setUsers([]);
      return;
    }

    // Get text before cursor
    const textBeforeCursor = text.substring(0, cursorPosition);
    
    // Check for @ mention
    const mentionMatch = textBeforeCursor.match(/@([a-z0-9_]*)$/i);
    if (mentionMatch) {
      const query = mentionMatch[1];
      const position = getCaretPosition(textareaElement);
      setAutocomplete({
        type: "mention",
        query,
        position,
        selectedIndex: 0,
      });
      
      // Search users
      setIsLoadingUsers(true);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchUsers(query, 5);
        setUsers(results);
        setIsLoadingUsers(false);
      }, 300);
      return;
    }

    // Check for # hashtag
    const hashtagMatch = textBeforeCursor.match(/(?:^|\s)#([a-z0-9_]*)$/i);
    if (hashtagMatch) {
      const query = hashtagMatch[1];
      const position = getCaretPosition(textareaElement);
      setAutocomplete({
        type: "hashtag",
        query,
        position,
        selectedIndex: 0,
      });
      return;
    }

    // No match, hide autocomplete
    setAutocomplete({ type: null, query: "", position: null, selectedIndex: 0 });
    setUsers([]);
    setIsLoadingUsers(false);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [text, cursorPosition, textareaElement]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (autocomplete.type === null) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAutocomplete((prev) => ({
        ...prev,
        selectedIndex:
          prev.type === "mention"
            ? Math.min(prev.selectedIndex + 1, users.length - 1)
            : prev.selectedIndex,
      }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAutocomplete((prev) => ({
        ...prev,
        selectedIndex: Math.max(prev.selectedIndex - 1, 0),
      }));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (autocomplete.type === "mention" && users.length > 0) {
        const selectedUser = users[autocomplete.selectedIndex];
        if (selectedUser) {
          const mentionText = `@${selectedUser.userId}`;
          onSelect(text, mentionText);
          setAutocomplete({ type: null, query: "", position: null, selectedIndex: 0 });
        }
      } else if (autocomplete.type === "hashtag" && autocomplete.query.length > 0) {
        const hashtagText = `#${autocomplete.query.toLowerCase()}`;
        onSelect(text, hashtagText);
        setAutocomplete({ type: null, query: "", position: null, selectedIndex: 0 });
      }
    } else if (e.key === "Escape") {
      setAutocomplete({ type: null, query: "", position: null, selectedIndex: 0 });
    }
  };

  const handleSelectMention = (user: User) => {
    const mentionText = `@${user.userId}`;
    onSelect(text, mentionText);
    setAutocomplete({ type: null, query: "", position: null, selectedIndex: 0 });
  };

  return {
    autocomplete,
    users,
    isLoadingUsers,
    handleKeyDown,
    handleSelectMention,
  };
}

function getCaretPosition(element: HTMLDivElement): { top: number; left: number } {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { top: 0, left: 0 };
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return {
    top: rect.bottom - elementRect.top + 5,
    left: rect.left - elementRect.left,
  };
}

interface AutocompleteDropdownProps {
  autocomplete: AutocompleteState;
  users: User[];
  isLoadingUsers: boolean;
  onSelectMention: (user: User) => void;
  selectedIndex: number;
}

export function AutocompleteDropdown({
  autocomplete,
  users,
  isLoadingUsers,
  onSelectMention,
  selectedIndex,
}: AutocompleteDropdownProps) {
  if (autocomplete.type === null || !autocomplete.position) {
    return null;
  }

  if (autocomplete.type === "mention") {
    if (isLoadingUsers) {
      return (
        <div
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
          style={{
            top: `${autocomplete.position.top}px`,
            left: `${autocomplete.position.left}px`,
          }}
        >
          <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
        </div>
      );
    }

    if (users.length === 0 && autocomplete.query.length === 0) {
      return (
        <div
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
          style={{
            top: `${autocomplete.position.top}px`,
            left: `${autocomplete.position.left}px`,
          }}
        >
          <div className="px-3 py-2 text-sm text-gray-500">Start typing to search users</div>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
          style={{
            top: `${autocomplete.position.top}px`,
            left: `${autocomplete.position.left}px`,
          }}
        >
          <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
        </div>
      );
    }

    return (
      <div
        className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto"
        style={{
          top: `${autocomplete.position.top}px`,
          left: `${autocomplete.position.left}px`,
          minWidth: "200px",
        }}
      >
        {users.map((user, index) => (
          <button
            key={user.id}
            onClick={() => onSelectMention(user)}
            className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors ${
              index === selectedIndex ? "bg-gray-50" : ""
            }`}
          >
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300 overflow-hidden">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={`${user.name} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{user.name}</div>
              <div className="text-xs text-gray-500 truncate">@{user.userId}</div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Hashtag autocomplete (simple suggestion)
  if (autocomplete.type === "hashtag") {
    return (
      <div
        className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
        style={{
          top: `${autocomplete.position.top}px`,
          left: `${autocomplete.position.left}px`,
        }}
      >
        <div className="px-3 py-2 text-sm text-gray-500">
          Type to create a hashtag
        </div>
      </div>
    );
  }

  return null;
}

