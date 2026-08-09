import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPostById } from "@/lib/db-posts";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/feed/post-card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const post = await getPostById(id, session?.user?.id);

  if (!post) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <aside className="hidden lg:block lg:col-span-3 sticky top-22">
              <LeftSidebar />
            </aside>

            <main className="col-span-1 md:col-span-8 lg:col-span-6 space-y-4">
              {/* Back to Feed Link */}
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Bumalik sa Feed</span>
                </Link>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kompletong Diskusyon</span>
                </div>
              </div>

              {/* Target Post Card with Auto-Expanded Discussion */}
              <PostCard
                post={post}
                isHighlighted={true}
                onVote={() => {}}
                onBookmark={() => {}}
              />
            </main>

            <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-22">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
