import type { TrendingRoute } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, ArrowRight, MessageCircle } from "lucide-react";

interface TrendingRoutesProps {
  routes: TrendingRoute[];
  onRouteClick?: (origin: string, destination: string) => void;
}

export function TrendingRoutes({ routes, onRouteClick }: TrendingRoutesProps) {
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          Trending Routes Today
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <ul className="space-y-2.5">
          {routes.slice(0, 5).map((route) => (
            <li key={route.id}>
              <button
                type="button"
                onClick={() => onRouteClick?.(route.origin, route.destination)}
                className="w-full text-left p-2 rounded-md hover:bg-muted/60 transition-colors group flex items-center justify-between text-xs"
              >
                <div className="flex flex-col gap-0.5 truncate pr-2">
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1 truncate">
                    <span className="truncate">{route.origin}</span>
                    <ArrowRight className="w-3 h-3 shrink-0 text-muted-foreground group-hover:text-primary" />
                    <span className="truncate">{route.destination}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {route.region}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 bg-muted/80 px-1.5 py-0.5 rounded">
                  <MessageCircle className="w-3 h-3" />
                  <span>{route.questionCount}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
