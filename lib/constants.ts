import type { Region, TransportMode, FeedTab } from "@/types";

export const REGIONS: Region[] = [
  "All Regions",
  "Metro Manila",
  "Cebu",
  "Davao",
  "Baguio",
  "Pampanga",
  "Laguna",
];

export const TRANSPORT_MODE_CONFIG: Record<
  TransportMode,
  { label: string; iconName: string; colorClass: string }
> = {
  Jeepney: {
    label: "Jeepney",
    iconName: "Truck",
    colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  "UV Express": {
    label: "UV Express",
    iconName: "Car",
    colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  Bus: {
    label: "Bus",
    iconName: "Bus",
    colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  "MRT-3": {
    label: "MRT-3",
    iconName: "TrainFront",
    colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  "LRT-1": {
    label: "LRT-1",
    iconName: "Train",
    colorClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  },
  "LRT-2": {
    label: "LRT-2",
    iconName: "Train",
    colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  Tricycle: {
    label: "Tricycle",
    iconName: "Bike",
    colorClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  Walk: {
    label: "Walk",
    iconName: "Footprints",
    colorClass: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  },
};

export const NAV_ITEMS = [
  { id: "home", label: "Feed Homepage", icon: "Home", href: "/", active: true },
  { id: "saved", label: "Saved Routes", icon: "Bookmark", href: "#" },
  { id: "my-questions", label: "My Questions", icon: "HelpCircle", href: "#" },
  { id: "contributors", label: "Top Contributors", icon: "Award", href: "#" },
  { id: "guidelines", label: "Community Rules", icon: "ShieldCheck", href: "#" },
];

export const BRAND_TAGLINE =
  "Gawing accessible ang commute knowledge para sa lahat — isang platform kung saan ang sagot ng komunidad ay nagiging gabay ng lahat.";
