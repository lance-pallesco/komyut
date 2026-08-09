import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserQuestions } from "@/lib/db-posts";
import { MyQuestionsClientContainer } from "@/components/my-questions/my-questions-client-container";
import { redirect } from "next/navigation";

export default async function MyQuestionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const initialPosts = await getUserQuestions(session.user.id);

  return <MyQuestionsClientContainer initialPosts={initialPosts} />;
}
