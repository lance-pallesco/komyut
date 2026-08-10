"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { FeedLayout } from "@/components/layout/feed-layout";
import { useFeedFilter } from "@/hooks/use-feed-filter";
import type { Post } from "@/types";

export function FeedClientContainer({ initialPosts }: { initialPosts: Post[] }) {
  const filterHook = useFeedFilter(initialPosts);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if ((session?.user as any)?.isNewUser) {
      router.replace("/rules?welcome=true");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar
        searchQuery={filterHook.searchQuery}
        onSearchChange={filterHook.handleSearchChange}
      />
      <FeedLayout filterHook={filterHook} />
    </div>
  );
}
