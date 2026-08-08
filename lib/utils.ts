import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely get the absolute URL on client or fallback on server
 */
export function getAbsoluteUrl(path: string = ""): string {
  if (typeof window !== "undefined") {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${window.location.origin}${cleanPath}`;
  }
  return path;
}

/**
 * Safely get the current page URL on client
 */
export function getCurrentUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.href;
  }
  return "";
}

/**
 * Safely copy text to clipboard with SSR safety guard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      return false;
    }
  }
  return false;
}
