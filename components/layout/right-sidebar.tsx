import { TrendingRoutes } from "@/components/sidebar/trending-routes";
import { TopContributors } from "@/components/sidebar/top-contributors";
import { CommunityStats } from "@/components/sidebar/community-stats";
import {
  MOCK_TRENDING_ROUTES,
  MOCK_TOP_CONTRIBUTORS,
  MOCK_COMMUNITY_STATS,
} from "@/lib/mock-data";

interface RightSidebarProps {
  onRouteClick?: (origin: string, destination: string) => void;
}

export function RightSidebar({ onRouteClick }: RightSidebarProps) {
  return (
    <aside className="space-y-4" aria-label="Community Insights">
      <TrendingRoutes
        routes={MOCK_TRENDING_ROUTES}
        onRouteClick={onRouteClick}
      />
      <TopContributors contributors={MOCK_TOP_CONTRIBUTORS} />
      <CommunityStats stats={MOCK_COMMUNITY_STATS} />
    </aside>
  );
}
