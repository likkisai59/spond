import {
  format,
  formatDistanceToNow,
  isValid,
  parseISO,
  type FormatOptions,
} from "date-fns";

export const DEFAULT_DATE_FORMAT = "MMM d, yyyy";
export const DEFAULT_DATETIME_FORMAT = "MMM d, yyyy · h:mm a";

function toDate(value?: Date | string | number | null): Date | null {
  if (!value || value === "undefined" || value === "null") return null;
  try {
    const date = value instanceof Date ? value : parseISO(String(value));
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

export function formatDate(
  value: Date | string | number,
  pattern: string = DEFAULT_DATE_FORMAT,
  options?: FormatOptions
): string {
  const date = toDate(value);
  return date ? format(date, pattern, options) : "—";
}

export function formatDateTime(
  value: Date | string | number,
  pattern: string = DEFAULT_DATETIME_FORMAT,
  options?: FormatOptions
): string {
  return formatDate(value, pattern, options);
}

export function formatRelative(value: Date | string | number): string {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "—";
}

export function isValidDate(value: Date | string | number): boolean {
  return toDate(value) !== null;
}
