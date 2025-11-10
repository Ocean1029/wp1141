import { getAllPosts, getFollowingPosts } from "@/lib/server/posts";
import type { Post } from "@/types";
import { PostCard } from "../post/PostCard";
import type { FeedTab } from "./FeedTabs";

interface FeedListProps {
  activeTab: FeedTab;
}

export async function FeedList({ activeTab }: FeedListProps) {
  // Decide which dataset to load based on the current tab selection.
  const posts: Post[] =
    activeTab === "following" ? await getFollowingPosts() : await getAllPosts();

  const emptyStateMessage =
    activeTab === "following"
      ? "Follow someone to see posts in this feed."
      : "No posts yet. Be the first to post!";

  return (
    <div className="feed__list divide-y divide-gray-200">
      {posts.length === 0 ? (
        <div className="feed__empty p-8 text-center text-gray-500">
          {emptyStateMessage}
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}

