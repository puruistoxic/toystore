/**
 * Centralized date/time utilities for consistent timezone handling
 * All dates from the server are assumed to be in UTC
 * All dates displayed to users should be in their local timezone (or configured timezone)
 */

/**
 * Get the user's timezone (defaults to Asia/Kolkata for Indian users)
 * Can be configured via environment variable or user preference
 */
export function getUserTimezone(): string {
  // For Indian applications, default to IST
  // Can be made configurable via user settings or environment variable
  return process.env.REACT_APP_TIMEZONE || 'Asia/Kolkata';
}

/**
 * Convert a UTC date string from the server to a Date object
 * Handles both ISO strings and MySQL datetime strings
 * Server dates are assumed to be in UTC
 */
export function parseServerDate(dateString: string | null | undefined | Date): Date | null {
  if (!dateString) return null;
  
  // If it's already a Date object, return it
  if (typeof dateString === 'object' && dateString instanceof Date) return dateString;
  
  let dateStr = String(dateString).trim();
  
  // MySQL returns dates in format: 'YYYY-MM-DD HH:MM:SS' (no timezone)
  // We need to treat these as UTC by appending 'Z'
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    // MySQL datetime format - replace space with T and append Z for UTC
    dateStr = dateStr.replace(' ', 'T') + 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    // ISO format without timezone - append Z for UTC
    dateStr = dateStr + 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // Date only - treat as UTC midnight
    dateStr = dateStr + 'T00:00:00Z';
  }
  // If it already has timezone info (Z, +, -), use as-is
  
  // Parse the date string
  const date = new Date(dateStr);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return null;
  }
  
  return date;
}

/**
 * Format a date for display in the user's local timezone
 * Returns a formatted string in the user's locale (en-IN for Indian users)
 */
export function formatDate(dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const date = parseServerDate(dateString);
  if (!date) return '—';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: getUserTimezone(), // Use configured timezone (default: Asia/Kolkata)
    ...options
  };
  
  return date.toLocaleString('en-IN', defaultOptions);
}

/**
 * Format a date as relative time (e.g., "5 hours ago", "2 days ago")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  const date = parseServerDate(dateString);
  if (!date) return '—';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffYears >= 1) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;

  // Fallback to formatted date
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a date for date input fields (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | null | undefined): string {
  const date = parseServerDate(dateString);
  if (!date) return '';
  
  // Get local date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format a date as time only (HH:MM)
 */
export function formatTime(dateString: string | null | undefined): string {
  const date = parseServerDate(dateString);
  if (!date) return '—';
  
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a date as date only (DD MMM YYYY)
 */
export function formatDateOnly(dateString: string | null | undefined): string {
  const date = parseServerDate(dateString);
  if (!date) return '—';
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: getUserTimezone()
  });
}

/**
 * Format a date with full date and time
 */
export function formatDateTime(dateString: string | null | undefined): string {
  const date = parseServerDate(dateString);
  if (!date) return '—';
  
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: getUserTimezone(),
    timeZoneName: 'short'
  });
}

/**
 * Convert a local date to UTC for sending to server
 * Used when submitting forms with date inputs
 */
export function localDateToUTC(localDateString: string): string {
  if (!localDateString) return '';
  
  // Parse as local date
  const localDate = new Date(localDateString + 'T00:00:00');
  
  // Return ISO string (which is in UTC)
  return localDate.toISOString();
}

/**
 * Get current date in local timezone for date inputs
 */
export function getCurrentLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a future date (n days from now) in local timezone for date inputs
 */
export function getFutureLocalDate(days: number): string {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const year = futureDate.getFullYear();
  const month = String(futureDate.getMonth() + 1).padStart(2, '0');
  const day = String(futureDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

