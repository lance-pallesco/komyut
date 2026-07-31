"use client";

import type { Region } from "@/types";
import { REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RegionFilterProps {
  activeRegion: Region;
  onRegionChange: (region: Region) => void;
}

export function RegionFilter({
  activeRegion,
  onRegionChange,
}: RegionFilterProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
      <span className="text-[11px] font-semibold text-muted-foreground/70 shrink-0 pr-1">
        Rehiyon:
      </span>
      {REGIONS.map((region) => {
        const isActive = activeRegion === region;
        return (
          <button
            key={region}
            onClick={() => onRegionChange(region)}
            className={cn(
              "shrink-0 text-xs px-2.5 py-1 font-medium rounded-full transition-colors min-h-[30px] flex items-center border",
              isActive
                ? "bg-primary text-primary-foreground border-primary font-semibold shadow-2xs"
                : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/50 hover:bg-muted/70"
            )}
          >
            {region}
          </button>
        );
      })}
    </div>
  );
}
