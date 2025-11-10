import { getHashtagPosts } from "@/lib/server/posts";
import { PostCard } from "@/components/post/PostCard";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";

interface HashtagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export default async function HashtagPage({ params }: HashtagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const sanitizedTag = decodedTag.replace(/^#/, "").trim();
  const session = await auth();
  const posts = sanitizedTag ? await getHashtagPosts(sanitizedTag) : [];

  return (
    <div className="border-x border-gray-200 min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <a
            href="/home"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </a>
        </div>
        <h1 className="mt-3 text-xl font-bold">#{sanitizedTag || decodedTag}</h1>
        <p className="text-sm text-gray-500 mt-1">Showing posts tagged with #{sanitizedTag || decodedTag}</p>
      </header>
      <main>
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No posts found for #{sanitizedTag || decodedTag}.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


