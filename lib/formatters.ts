export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function formatRelativeTime(dateInput?: string | Date | number): string {
  if (!dateInput) return "Just now";
  if (typeof dateInput === "string" && dateInput === "Pinned") return "Pinned";

  let date: Date;
  if (typeof dateInput === "string" && dateInput === "Just now") {
    date = new Date();
  } else if (typeof dateInput === "string" || typeof dateInput === "number") {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) {
    // Return relative string if already pre-formatted e.g. "2h ago"
    return dateInput.toString();
  }

  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 30) {
    return "Just now";
  }
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const isSameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: isSameYear ? undefined : "numeric",
  });
}

export function formatJoinedDate(dateInput?: string | Date): string {
  if (!dateInput) return "Joined August 2026";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Joined August 2026";
  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `Joined ${monthName} ${year}`;
}
