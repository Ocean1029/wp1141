import { ThreadContainer } from "@/components/thread/ThreadContainer";

export default function PostThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="border-x border-gray-200">
      <ThreadContainer postId={params} />
    </div>
  );
}

