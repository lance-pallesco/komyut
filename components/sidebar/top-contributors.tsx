import type { TopContributor } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface TopContributorsProps {
  contributors: TopContributor[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
  return (
    <Card className="border-border/60 shadow-2xs">
      <CardHeader className="pb-2.5 pt-4 px-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Top Route Contributors
          </span>
          <span className="text-[10px] text-primary lowercase hover:underline cursor-pointer">
            See all
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <ol className="space-y-3">
          {contributors.slice(0, 5).map((tc) => {
            const initials = tc.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2);

            return (
              <li
                key={tc.id}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-semibold text-xs text-muted-foreground/70 w-4 text-center">
                    #{tc.rank}
                  </span>
                  <Avatar className="h-8 w-8 border border-border shrink-0">
                    <AvatarImage src={tc.user.avatarUrl} alt={tc.user.name} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate hover:underline cursor-pointer">
                      {tc.user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                      {tc.user.verifiedAnswersCount} verified guides
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-foreground text-xs">
                    {formatNumber(tc.user.reputationPoints)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">pts</span>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
