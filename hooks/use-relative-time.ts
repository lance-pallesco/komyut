"use client";

import { useState, useEffect } from "react";
import { formatRelativeTime } from "@/lib/formatters";

export function useRelativeTime(createdAt?: string | Date | number): string {
  const [formatted, setFormatted] = useState(() => formatRelativeTime(createdAt));

  useEffect(() => {
    setFormatted(formatRelativeTime(createdAt));

    // Re-evaluate relative time every 15 seconds so "Just now" updates to "45s ago", "1m ago", etc.
    const interval = setInterval(() => {
      setFormatted(formatRelativeTime(createdAt));
    }, 15000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return formatted;
}
