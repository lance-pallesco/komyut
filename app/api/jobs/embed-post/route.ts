import { embedPostTask } from "@/lib/ai-pipeline";
import { enqueueJob } from "@/lib/qstash";

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();
    if (!postId) {
      return new Response("Missing postId", { status: 400 });
    }

    const success = await embedPostTask(postId);
    if (!success) {
      return new Response("Embedding failed", { status: 500 });
    }

    // Queue next step
    await enqueueJob("/api/jobs/generate-suggestion", { postId });

    return Response.json({ ok: true, postId });
  } catch (err: any) {
    console.error("[QStash Embed Post Route] Error:", err);
    return new Response(err?.message || "Internal Error", { status: 500 });
  }
}
