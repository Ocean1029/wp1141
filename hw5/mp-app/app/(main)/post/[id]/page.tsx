import { auth } from "@/lib/auth";
import { ThreadContainer } from "@/components/thread/ThreadContainer";

export default async function PostThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  return (
    <div className="border-x border-gray-200">
      <ThreadContainer postId={id} session={session} />
    </div>
  );
}

