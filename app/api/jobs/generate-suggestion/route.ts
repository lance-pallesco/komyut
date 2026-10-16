import { generateSuggestionTask } from "@/lib/ai-pipeline";

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();
    if (!postId) {
      return new Response("Missing postId", { status: 400 });
    }

    const suggestion = await generateSuggestionTask(postId);

    return Response.json({ ok: true, suggestion });
  } catch (err: any) {
    console.error("[QStash Generate Suggestion Route] Error:", err);
    return new Response(err?.message || "Internal Error", { status: 500 });
  }
}
