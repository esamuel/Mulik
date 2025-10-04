import { nanoid } from 'nanoid';

// Characters to use for room codes (excluding confusing ones: 0, O, 1, I)
const ROOM_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a 6-character uppercase alphanumeric room code
 * Excludes confusing characters (0, O, 1, I) for better user experience
 * @returns A unique 6-character room code
 */
export const generateRoomCode = (): string => {
  return nanoid(6).toUpperCase().split('').map(char => {
    // Replace any potentially confusing characters
    const charCode = char.charCodeAt(0);
    const index = charCode % ROOM_CODE_ALPHABET.length;
    return ROOM_CODE_ALPHABET[index];
  }).join('');
};

/**
 * Validates if a room code meets the required format
 * @param code - The room code to validate
 * @returns True if the code is valid, false otherwise
 */
export const validateRoomCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // Remove any formatting (hyphens)
  const cleanCode = code.replace(/-/g, '');
  
  // Check if it's exactly 6 characters
  if (cleanCode.length !== 6) {
    return false;
  }

  // Check if all characters are alphanumeric and uppercase
  const alphanumericRegex = /^[A-Z0-9]+$/;
  return alphanumericRegex.test(cleanCode);
};

/**
 * Formats a room code for display with a hyphen in the middle
 * @param code - The room code to format
 * @returns Formatted room code (XXX-XXX)
 */
export const formatRoomCode = (code: string): string => {
  if (!code || typeof code !== 'string') {
    return '';
  }

  // Remove any existing formatting
  const cleanCode = code.replace(/-/g, '').toUpperCase();
  
  // Validate the code first
  if (!validateRoomCode(cleanCode)) {
    return code; // Return original if invalid
  }

  // Format as XXX-XXX
  return `${cleanCode.slice(0, 3)}-${cleanCode.slice(3)}`;
};

/**
 * Removes formatting from a room code
 * @param code - The formatted room code
 * @returns Clean room code without hyphens
 */
export const cleanRoomCode = (code: string): string => {
  if (!code || typeof code !== 'string') {
    return '';
  }
  
  return code.replace(/-/g, '').toUpperCase();
};
