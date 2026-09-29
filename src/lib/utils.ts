// ============================================================
// Utility Functions
// ============================================================
// Small helper functions used throughout the application.
// Think of these as "tools in a toolbox" that many parts
// of the app can use.
// ============================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn - Combine CSS class names intelligently
 *
 * This merges Tailwind CSS classes and handles conflicts.
 * For example: cn("bg-red-500", "bg-blue-500") → "bg-blue-500"
 * (blue wins because it was specified last)
 *
 * Usage in components:
 *   <div className={cn("base-styles", isActive && "active-styles")} />
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * clamp - Keep a number within a range
 *
 * Example: clamp(150, 0, 100) → 100 (capped at max)
 * Example: clamp(-5, 0, 100) → 0 (raised to min)
 * Example: clamp(50, 0, 100) → 50 (already in range)
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * formatDate - Convert a date to a readable string
 *
 * Example: formatDate(new Date()) → "Sep 29, 2026"
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * formatDateTime - Convert a date to a readable string with time
 *
 * Example: formatDateTime(new Date()) → "Sep 29, 2026, 1:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * formatRelativeTime - Show how long ago something happened
 *
 * Example: "2 hours ago", "3 days ago", "just now"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(date);
}

/**
 * generateTrackingCode - Create a unique issue tracking code
 *
 * Format: "CIV-1001", "CIV-1002", etc.
 * The number is based on how many issues already exist.
 */
export function generateTrackingCode(existingCount: number): string {
  const number = 1001 + existingCount;
  return `CIV-${number}`;
}

/**
 * slugify - Convert a string to a URL-friendly format
 *
 * Example: slugify("Road Infrastructure") → "road-infrastructure"
 * Example: slugify("Pokhara Metropolitan City") → "pokhara-metropolitan-city"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/[\s_]+/g, '-')   // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * truncate - Shorten text and add "..." if too long
 *
 * Example: truncate("This is a very long description", 20) → "This is a very lon..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * getStatusColor - Map issue statuses to display colors
 *
 * Used throughout the UI for status badges, timeline dots, etc.
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    REPORTED: '#6366f1',    // Indigo
    UNDER_REVIEW: '#8b5cf6', // Purple
    VERIFIED: '#3b82f6',     // Blue
    ASSIGNED: '#0ea5e9',     // Sky
    IN_PROGRESS: '#f59e0b',  // Amber
    PENDING: '#f97316',      // Orange
    RESOLVED: '#22c55e',     // Green
    REOPENED: '#ef4444',     // Red
    REJECTED: '#6b7280',     // Gray
  };
  return colors[status] || '#6b7280';
}

/**
 * getPriorityColor - Map priority levels to display colors
 */
export function getPriorityColor(level: string): string {
  const colors: Record<string, string> = {
    LOW: '#22c55e',      // Green
    MEDIUM: '#eab308',   // Yellow
    HIGH: '#f97316',     // Orange
    CRITICAL: '#ef4444', // Red
  };
  return colors[level] || '#6b7280';
}

/**
 * getSeverityColor - Map severity levels to display colors
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    LOW: '#22c55e',
    MEDIUM: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };
  return colors[severity] || '#6b7280';
}

/**
 * formatNumber - Format large numbers with commas
 *
 * Example: formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * getInitials - Get first letters of a name for avatar fallback
 *
 * Example: getInitials("Sajan Sharma") → "SS"
 * Example: getInitials("Ram") → "RA"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
