import type { UnansweredQuestion } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquareOff, ArrowRight, ChevronRight } from "lucide-react";

interface UnansweredQuestionsProps {
  questions: UnansweredQuestion[];
  onQuestionClick?: (origin: string, destination: string) => void;
  onSeeAll?: () => void;
}

export function UnansweredQuestions({
  questions,
  onQuestionClick,
  onSeeAll,
}: UnansweredQuestionsProps) {
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MessageSquareOff className="w-3.5 h-3.5 text-amber-500" />
          <span>Unanswered Questions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <ul className="space-y-2.5">
          {questions.slice(0, 4).map((q) => (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => onQuestionClick?.(q.origin, q.destination)}
                className="w-full text-left p-2 rounded-md hover:bg-muted/60 transition-colors group flex flex-col gap-1 text-xs cursor-pointer"
              >
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {q.title}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <span className="truncate">{q.origin}</span>
                    <ArrowRight className="w-2.5 h-2.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{q.destination}</span>
                  </span>
                  <span className="shrink-0 bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-medium">
                    {q.createdAt}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
      {onSeeAll && (
        <div className="border-t border-border/50 px-4 py-2.5 bg-muted/20 rounded-b-xl">
          <button
            type="button"
            onClick={onSeeAll}
            className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 group cursor-pointer"
          >
            <span>See all unanswered questions</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition-transform" />
          </button>
        </div>
      )}
    </Card>
  );
}
