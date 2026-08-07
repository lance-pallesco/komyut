import { ArrowRight } from "lucide-react";

interface PostRouteDisplayProps {
  origin: string;
  destination: string;
  className?: string;
}

export function PostRouteDisplay({
  origin,
  destination,
  className,
}: PostRouteDisplayProps) {
  return (
    <div
      className={`leading-snug break-words text-xs sm:text-xs  select-none ${className || "text-foreground/90"
        }`}
    >
      <span className="text-foreground/80 ">{origin}</span>
      <ArrowRight className="inline-block w-3.5 h-3.5 mx-1.5 align-middle shrink-0 stroke-[2.2]" />
      <span className="text-foreground/80 ">{destination}</span>
    </div>
  );
}

