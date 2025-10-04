/**
 * Network utilities for mobile device access
 */

/**
 * Gets the current host URL that works for mobile devices
 * In development, this will use the network IP instead of localhost
 */
export const getNetworkUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5173';
  }

  const currentHost = window.location.host;
  const protocol = window.location.protocol;
  
  // If we're already on a network IP (not localhost), use it
  if (!currentHost.includes('localhost') && !currentHost.includes('127.0.0.1')) {
    return `${protocol}//${currentHost}`;
  }

  // For development, we'll use the current URL
  return `${protocol}//${currentHost}`;
};

/**
 * Creates a mobile-friendly join URL for QR codes
 */
export const createJoinUrl = (roomCode: string): string => {
  const baseUrl = getNetworkUrl();
  return `${baseUrl}/join?code=${roomCode}`;
};

/**
 * Gets instructions for mobile access
 */
export const getMobileAccessInstructions = (): string => {
  const currentHost = window.location.host;
  
  if (currentHost.includes('localhost')) {
    return `To access from mobile devices:
1. Make sure your phone is on the same WiFi network
2. Use your computer's IP address instead of localhost
3. Find your IP in the terminal where you ran 'npm run dev'
4. Look for the "Network:" URL (e.g., http://192.168.1.100:5173)`;
  }
  
  return 'This URL should work on mobile devices on the same network.';
};

/**
 * Checks if the current URL is mobile-accessible
 */
export const isMobileAccessible = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const host = window.location.host;
  return !host.includes('localhost') && !host.includes('127.0.0.1');
};
