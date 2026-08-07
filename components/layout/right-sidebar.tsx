"use client";

import { useRouter } from "next/navigation";
import { TrendingRoutes } from "@/components/sidebar/trending-routes";
import { UnansweredQuestions } from "@/components/sidebar/unanswered-questions";
import { TopContributors } from "@/components/sidebar/top-contributors";
import { CommunityStats } from "@/components/sidebar/community-stats";
import {
  MOCK_TRENDING_ROUTES,
  MOCK_UNANSWERED_QUESTIONS,
  MOCK_TOP_CONTRIBUTORS,
  MOCK_COMMUNITY_STATS,
} from "@/lib/mock-data";

interface RightSidebarProps {
  onRouteClick?: (origin: string, destination: string) => void;
}

export function RightSidebar({ onRouteClick }: RightSidebarProps) {
  const router = useRouter();

  return (
    <aside className="space-y-4" aria-label="Community Insights">
      <TrendingRoutes
        routes={MOCK_TRENDING_ROUTES}
        onRouteClick={onRouteClick}
        onSeeAll={() => router.push("/feed?sort=most_voted")}
      />

      <UnansweredQuestions
        questions={MOCK_UNANSWERED_QUESTIONS}
        onQuestionClick={onRouteClick}
        onSeeAll={() => router.push("/feed?sort=unanswered")}
      />

      <TopContributors contributors={MOCK_TOP_CONTRIBUTORS} />

      <CommunityStats stats={MOCK_COMMUNITY_STATS} />
    </aside>
  );
}
