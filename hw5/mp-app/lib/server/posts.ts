"use server";

/* eslint-disable @typescript-eslint/no-unused-vars */

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusher } from "@/lib/pusher";
import type { Post as FeedPost } from "@/types";
import { validateTextLength } from "@/lib/utils/text-parser";
import { formatRelativeTime } from "@/lib/utils/time";
import type { Draft } from "@/types";

/**
 * Helper: materialize Prisma records into feed payloads.
 * This helper centralises viewer-specific flags (liked/author) to keep exported functions tidy.
 */
type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: true;
  };
}>;

async function mapPostsForFeed(
  posts: PostWithAuthor[],
  viewerId?: string | null,
): Promise<FeedPost[]> {
  if (posts.length === 0) {
    return [];
  }

  let viewerLikes = new Set<string>();
  let viewerReposts = new Set<string>();

  if (viewerId) {
    const [likedEntries, repostedEntries] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId: viewerId,
          postId: { in: posts.map((post) => post.id) },
        },
        select: { postId: true },
      }),
      prisma.repost.findMany({
        where: {
          userId: viewerId,
          postId: { in: posts.map((post) => post.id) },
        },
        select: { postId: true },
      }),
    ]);

    viewerLikes = new Set(likedEntries.map((entry) => entry.postId));
    viewerReposts = new Set(repostedEntries.map((entry) => entry.postId));
  }

  return posts.map((post) => ({
    id: post.id,
    text: post.text,
    imageUrl: post.imageUrl ?? undefined,
    createdAt: post.createdAt.toISOString(),
    relativeTime: formatRelativeTime(post.createdAt),
    replyCount: post.replyCount,
    repostCount: post.repostCount,
    likeCount: post.likeCount,
    viewerHasLiked: viewerId ? viewerLikes.has(post.id) : false,
    viewerHasReposted: viewerId ? viewerReposts.has(post.id) : false,
    isOwnPost: viewerId ? post.authorId === viewerId : false,
    author: {
      userId:
        (post.author as { userID?: string | null }).userID ??
        `user-${post.authorId.slice(0, Math.max(4, Math.min(8, post.authorId.length)))}`,
      name: post.author.name,
      imageUrl: (post.author as { image?: string | null }).image ?? undefined,
    },
  }));
}

/**
 * Server Action: Fetch all posts for "All" feed.
 */
export async function getAllPosts(): Promise<FeedPost[]> {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    const posts = await prisma.post.findMany({
      where: {
        deletedAt: null,
        isDraft: false,
        parentId: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
      },
      take: 30,
    });

    return mapPostsForFeed(posts, viewerId);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

/**
 * Server Action: Fetch posts from followed users for the "Following" feed.
 */
export async function getFollowingPosts(): Promise<FeedPost[]> {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    if (!viewerId) {
      return [];
    }

    const following = await prisma.follow.findMany({
      where: { followerId: viewerId },
      select: { followingId: true },
    });

    const followingIds = following.map((item) => item.followingId);

    if (followingIds.length === 0) {
    return [];
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: followingIds },
        deletedAt: null,
        isDraft: false,
        parentId: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
      },
      take: 30,
    });

    return mapPostsForFeed(posts, viewerId);
  } catch (error) {
    console.error("Error fetching following posts:", error);
    return [];
  }
}

interface CreatePostResult {
  success: boolean;
  error?: string;
  postId?: string;
}

/**
 * Server Action: Create a new post (top-level or reply).
 */
export async function createPost(
  text: string,
  parentId?: string,
  isDraft: boolean = false,
  imageUrl?: string,
): Promise<CreatePostResult> {
  try {
    const session = await auth();
    const authorId = session?.user?.id;

    if (!authorId) {
      return { success: false, error: "Unauthorized" };
    }

    const sanitizedText = text.trim();

    if (sanitizedText.length === 0) {
      return { success: false, error: "Post cannot be empty" };
    }

    const { valid } = validateTextLength(sanitizedText);

    if (!valid) {
      return { success: false, error: "Post exceeds the 280 character limit" };
    }

    const created = await prisma.post.create({
      data: {
        authorId,
        text: sanitizedText,
        imageUrl: imageUrl ?? null,
        parentId: parentId ?? null,
        isDraft,
      },
      select: {
        id: true,
        parentId: true,
        isDraft: true,
      },
    });

    if (!created.isDraft && created.parentId) {
      // Increment reply count for parent post
      const updatedParent = await prisma.post.update({
        where: { id: created.parentId },
        data: {
          replyCount: {
            increment: 1,
          },
        },
        select: { replyCount: true },
      });

      // Send Pusher event for reply creation
      try {
        if (pusher) {
          await pusher.trigger(`post-${created.parentId}`, "reply:created", {
            postId: created.parentId,
            replyId: created.id,
            replyCount: updatedParent.replyCount,
          });
        }
      } catch (error) {
        console.error("Error sending Pusher event:", error);
      }
    }

    if (!created.isDraft) {
      // Send Pusher event for new post on home feed
      try {
        if (pusher) {
          await pusher.trigger("home-feed", "post:new", {
            postId: created.id,
          });
        }
      } catch (error) {
        console.error("Error sending Pusher event:", error);
      }

      revalidatePath("/home");
      if (created.parentId) {
        revalidatePath(`/post/${created.parentId}`);
      }
    }

    return { success: true, postId: created.id };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

/**
 * Server Action: Fetch a single post with its replies
 */
export async function getPostWithReplies(postId: string): Promise<{
  post: FeedPost | null;
  replies: FeedPost[];
}> {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
        deletedAt: null,
      },
      include: {
        author: true,
      },
    });

    if (!post) {
      return { post: null, replies: [] };
    }

    // Only show draft posts to their author
    if (post.isDraft && post.authorId !== viewerId) {
      return { post: null, replies: [] };
    }

    // For public posts, only show non-draft posts
    if (post.isDraft && post.authorId === viewerId) {
      // Allow author to view their own draft, but don't show replies
      const [mappedPost] = await mapPostsForFeed([post], viewerId);
      return {
        post: mappedPost ?? null,
        replies: [],
      };
    }

    const replies = await prisma.post.findMany({
      where: {
        parentId: postId,
        deletedAt: null,
        isDraft: false,
      },
      orderBy: { createdAt: "asc" },
      include: {
        author: true,
      },
    });

    const [mappedPost] = await mapPostsForFeed([post], viewerId);
    const mappedReplies = await mapPostsForFeed(replies, viewerId);
    
    return {
      post: mappedPost ?? null,
      replies: mappedReplies,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { post: null, replies: [] };
  }
}

/**
 * Server Action: Get user's drafts
 */
export async function getDrafts(): Promise<Draft[]> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return [];
    }

    const drafts = await prisma.post.findMany({
      where: {
        authorId: userId,
        isDraft: true,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        createdAt: true,
      },
    });

    return drafts.map((draft) => ({
      id: draft.id,
      text: draft.text,
      createdAt: draft.createdAt.toISOString(),
      relativeTime: formatRelativeTime(draft.createdAt),
    }));
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return [];
  }
}

/**
 * Server Action: Delete a post (soft delete)
 */
export async function deletePost(postId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, parentId: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.authorId !== userId) {
      return { success: false, error: "Unauthorized: You can only delete your own posts" };
    }

    // Soft delete: set deletedAt timestamp
    await prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });

    // If this is a reply, decrement parent's reply count
    if (post.parentId) {
      await prisma.post.update({
        where: { id: post.parentId },
        data: { replyCount: { decrement: 1 } },
      });
    }

    // Revalidate relevant paths
    revalidatePath("/home");
    if (post.parentId) {
      revalidatePath(`/post/${post.parentId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

/**
 * Server Action: Get posts by user ID (userID)
 * Includes both original posts and reposts
 */
export async function getUserPosts(userId: string): Promise<FeedPost[]> {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    // Find user by userID
    const user = await (prisma.user as any).findUnique({
      where: { userID: userId },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    // Get original posts
    const originalPosts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        deletedAt: null,
        isDraft: false,
        parentId: null, // Only show top-level posts, not replies
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
      },
      take: 50,
    });

    // Get reposted posts
    const reposts = await prisma.repost.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: true,
          },
        },
      },
      take: 50,
    });

    // Filter out null posts, deleted posts, drafts, and replies
    const repostedPosts = reposts
      .map((repost) => repost.post)
      .filter(
        (post) =>
          post !== null &&
          post.deletedAt === null &&
          post.isDraft === false &&
          post.parentId === null,
      ) as PostWithAuthor[];

    // Combine and sort by creation time (repost time for reposts)
    // For reposts, we'll use the repost createdAt time for sorting
    const allPosts: (PostWithAuthor & { repostedAt?: Date })[] = [
      ...originalPosts.map((post) => ({ ...post, repostedAt: undefined })),
      ...repostedPosts.map((post) => {
        const repost = reposts.find((r) => r.postId === post.id);
        return { ...post, repostedAt: repost?.createdAt };
      }),
    ];

    // Sort by repostedAt (if exists) or createdAt, descending
    allPosts.sort((a, b) => {
      const timeA = a.repostedAt ?? a.createdAt;
      const timeB = b.repostedAt ?? b.createdAt;
      return timeB.getTime() - timeA.getTime();
    });

    // Remove repostedAt before mapping
    const postsToMap = allPosts.map(({ repostedAt, ...post }) => post);

    return mapPostsForFeed(postsToMap, viewerId);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
}

/**
 * Server Action: Get user's reposted posts only
 */
export async function getUserReposts(userId: string): Promise<FeedPost[]> {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    // Find user by userID
    const user = await (prisma.user as any).findUnique({
      where: { userID: userId },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    // Get reposted posts
    const reposts = await prisma.repost.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: true,
          },
        },
      },
      take: 50,
    });

    // Filter out null posts, deleted posts, drafts, and replies
    const repostedPosts = reposts
      .map((repost) => repost.post)
      .filter(
        (post) =>
          post !== null &&
          post.deletedAt === null &&
          post.isDraft === false &&
          post.parentId === null,
      ) as PostWithAuthor[];

    return mapPostsForFeed(repostedPosts, viewerId);
  } catch (error) {
    console.error("Error fetching user reposts:", error);
    return [];
  }
}

/**
 * Server Action: Get user's liked posts
 */
export async function getLikedPosts(userId: string): Promise<FeedPost[]> {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    // Find user by userID
    const user = await (prisma.user as any).findUnique({
      where: { userID: userId },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    // Get liked posts
    const likes = await prisma.like.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: true,
          },
        },
      },
      take: 50,
    });

    // Filter out deleted/draft posts and map to feed format
    const posts = likes
      .map((like) => like.post)
      .filter(
        (post) =>
          post !== null &&
          post.deletedAt === null &&
          post.isDraft === false,
      ) as PostWithAuthor[];

    return mapPostsForFeed(posts, viewerId);
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
}

/**
 * Server Action: Fetch posts containing a specific hashtag.
 */
export async function getHashtagPosts(hashtag: string): Promise<FeedPost[]> {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    const sanitizedTag = hashtag.replace(/^#/, "").trim();

    if (!sanitizedTag) {
      return [];
    }

    const posts = await prisma.post.findMany({
      where: {
        deletedAt: null,
        isDraft: false,
        parentId: null,
        text: {
          contains: `#${sanitizedTag}`,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
      },
      take: 30,
    });

    return mapPostsForFeed(posts, viewerId);
  } catch (error) {
    console.error("Error fetching hashtag posts:", error);
    return [];
  }
}

