import type { TransportMode } from "@/types";
import { TRANSPORT_MODE_CONFIG } from "@/lib/constants";
import {
  Bus,
  Car,
  Truck,
  TrainFront,
  Train,
  TrainTrack,
  Bike,
  Ship,
  Footprints,
  Navigation,
} from "lucide-react";

interface TransportBadgeProps {
  mode: TransportMode;
}

const ICON_MAP = {
  Bus,
  Car,
  Truck,
  TrainFront,
  Train,
  TrainTrack,
  Bike,
  Ship,
  Footprints,
};

export function TransportBadge({ mode }: TransportBadgeProps) {
  const config = TRANSPORT_MODE_CONFIG[mode] || {
    label: mode,
    iconName: "Navigation",
  };

  const IconComponent =
    ICON_MAP[config.iconName as keyof typeof ICON_MAP] || Navigation;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/40">
      <IconComponent className="w-3 h-3 text-muted-foreground/80 shrink-0" />
      {config.label}
    </span>
  );
}
