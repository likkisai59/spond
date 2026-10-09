import type { BreadcrumbItem } from "@/types";
export { formatDate, formatDateTime, formatRelative } from "./date";


export function getUserDisplayName(user: any, fallback: string = 'Not set'): string {
  if (!user) return fallback;
  const name = user.fullName?.trim() || user.full_name?.trim() || user.name?.trim() || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || fallback;
}
export function isClient(): boolean {
  return typeof window !== "undefined";
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "S";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "S";
}

export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function notImplemented(method: string): never {
  throw new Error(`[${method}] is not implemented (foundation skeleton).`);
}

export function pathToBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
  segments.reduce((acc, segment) => {
    const href = `${acc}/${segment}`;
    items.push({
      label: capitalize(decodeURIComponent(segment).replace(/-/g, " ")),
      href,
    });
    return href;
  }, "");
  return items;
}

export function formatFilePath(path: string): string {
  return path.split(/[/\\]/).join(" › ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(value: string): string {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  
  // If it's a raw S3 URL, we MUST proxy it through the backend to get a presigned URL
  if (url.includes("amazonaws.com")) {
    return `/api/v1/files/redirect?url=${encodeURIComponent(url)}`;
  }
  
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${apiBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

export function maskPhoneNumber(phone?: string | null, isAccepted?: boolean): string {
  if (!phone) return "Not provided";
  if (isAccepted) return phone;
  
  // Format: +91 9876543210 -> +91 98765XXXXX
  const match = phone.trim().match(/^(\+\d{1,4}\s*)?(\d{5})(\d+)/);
  if (match) {
    const [, code = "", first5, rest] = match;
    return `${code}${first5}${"X".repeat(rest.length)}`;
  }
  
  // Fallback if it doesn't match standard length (e.g., short number)
  const cleanPhone = phone.trim();
  if (cleanPhone.length <= 5) return "X".repeat(cleanPhone.length);
  return cleanPhone.substring(0, 5) + "X".repeat(cleanPhone.length - 5);
}
