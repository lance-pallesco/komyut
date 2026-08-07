import type { TopContributor } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, CheckCircle2, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface TopContributorsProps {
  contributors: TopContributor[];
  maxItems?: number;
  onSeeAll?: () => void;
}

export function TopContributors({
  contributors,
  maxItems = 3,
  onSeeAll,
}: TopContributorsProps) {
  return (
    <Card className="border-border/60 shadow-2xs">
      <CardHeader className="pb-2 pt-3.5 px-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Top Route Contributors</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <ol className="space-y-2.5">
          {contributors.slice(0, maxItems).map((tc) => {
            const initials = tc.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2);

            return (
              <li
                key={tc.id}
                className="flex items-center justify-between gap-2.5 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-[11px] text-muted-foreground/70 w-3.5 text-center">
                    #{tc.rank}
                  </span>
                  <Avatar className="h-7 w-7 border border-border shrink-0">
                    <AvatarImage src={tc.user.avatarUrl} alt={tc.user.name} />
                    <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate hover:underline cursor-pointer text-xs">
                      {tc.user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                      {tc.user.verifiedAnswersCount} verified guides
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-foreground text-[11px]">
                    {formatNumber(tc.user.reputationPoints)}
                  </span>
                  <span className="text-[9px] text-muted-foreground block -mt-0.5">pts</span>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
      {onSeeAll && (
        <div className="border-t border-border/50 px-4 py-2 bg-muted/20 rounded-b-xl">
          <button
            type="button"
            onClick={onSeeAll}
            className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 group cursor-pointer"
          >
            <span>See top contributors</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-transform" />
          </button>
        </div>
      )}
    </Card>
  );
}
