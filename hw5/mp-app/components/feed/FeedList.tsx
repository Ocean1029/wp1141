import { PostCard } from "../post/PostCard";

export async function FeedList() {
  // TODO: Fetch posts from Server Action
  const posts: unknown[] = [];

  return (
    <div className="divide-y divide-gray-200">
      {posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No posts yet. Be the first to post!
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}

