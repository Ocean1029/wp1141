"use server";

/* eslint-disable @typescript-eslint/no-unused-vars */

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  if (viewerId) {
    const likedEntries = await prisma.like.findMany({
      where: {
        userId: viewerId,
        postId: { in: posts.map((post) => post.id) },
      },
      select: { postId: true },
    });

    viewerLikes = new Set(likedEntries.map((entry) => entry.postId));
  }

  return posts.map((post) => ({
    id: post.id,
    text: post.text,
    createdAt: post.createdAt.toISOString(),
    relativeTime: formatRelativeTime(post.createdAt),
    replyCount: post.replyCount,
    repostCount: post.repostCount,
    likeCount: post.likeCount,
    viewerHasLiked: viewerId ? viewerLikes.has(post.id) : false,
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
      await prisma.post.update({
        where: { id: created.parentId },
        data: {
          replyCount: {
            increment: 1,
          },
        },
      });
    }

    if (!created.isDraft) {
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
 * Server Action: Get posts by user ID (userID)
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

    const posts = await prisma.post.findMany({
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

    return mapPostsForFeed(posts, viewerId);
  } catch (error) {
    console.error("Error fetching user posts:", error);
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

