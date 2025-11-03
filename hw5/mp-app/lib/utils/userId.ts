// User ID validation rules and utilities

export const USER_ID_PATTERN = /^[a-z0-9](?:_?[a-z0-9]){2,19}$/;

export const RESERVED_WORDS = [
  'admin',
  'api',
  'settings',
  'post',
  'home',
  'profile',
  'login',
  'register',
  'logout',
  'edit',
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a user ID according to platform rules
 */
export function validateUserId(userId: string): ValidationResult {
  // Length check
  if (userId.length < 3 || userId.length > 20) {
    return { valid: false, error: 'User ID must be 3-20 characters' };
  }

  // Pattern check (lowercase alphanumeric with underscores)
  if (!USER_ID_PATTERN.test(userId)) {
    return {
      valid: false,
      error: 'Invalid characters. Use lowercase letters, numbers, and underscores only',
    };
  }

  // Reserved words check
  if (RESERVED_WORDS.includes(userId)) {
    return { valid: false, error: 'This User ID is reserved' };
  }

  return { valid: true };
}

/**
 * Sanitizes a user ID input (trims and lowercases)
 */
export function sanitizeUserId(input: string): string {
  return input.trim().toLowerCase();
}

