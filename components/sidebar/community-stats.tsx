import type { CommunityStat } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users2 } from "lucide-react";

interface CommunityStatsProps {
  stats: CommunityStat[];
}

export function CommunityStats({ stats }: CommunityStatsProps) {
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Users2 className="w-3.5 h-3.5 text-primary" />
          Komunidad Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-border/60">
          {stats.map((stat, idx) => (
            <div key={stat.label} className={idx > 0 ? "pl-2" : ""}>
              <div className="text-base font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
