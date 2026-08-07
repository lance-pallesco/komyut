"use client";

import type { Region } from "@/types";
import { REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { X, Tag as TagIcon } from "lucide-react";

interface RegionFilterProps {
  activeRegion: Region;
  onRegionChange: (region: Region) => void;
  activeTagFilter?: string;
  onClearTag?: () => void;
}

export function RegionFilter({
  activeRegion,
  onRegionChange,
  activeTagFilter,
  onClearTag,
}: RegionFilterProps) {
  return (
    <div className="bg-card p-3 rounded-2xl border border-border/80 shadow-2xs space-y-2.5">
      {/* Active Tag Filter Chip (If present) */}
      {activeTagFilter && activeTagFilter.trim() !== "" && (
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs px-2.5 py-1 rounded-lg font-semibold">
            <TagIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Tag: #{activeTagFilter}</span>
            {onClearTag && (
              <button
                onClick={onClearTag}
                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors cursor-pointer"
                title="Clear tag filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Region Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
        <span className="text-[11px] font-semibold text-muted-foreground/70 shrink-0 pr-1">
          Region:
        </span>
        {REGIONS.map((region) => {
          const isActive = activeRegion === region;
          return (
            <button
              key={region}
              onClick={() => onRegionChange(region)}
              className={cn(
                "shrink-0 text-xs px-2.5 py-1 font-medium rounded-full transition-colors min-h-[28px] flex items-center border cursor-pointer",
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
    </div>
  );
}
