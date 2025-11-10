"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server Action: Toggle like on a post
 * Requires authentication - gets userId from session
 */
export async function toggleLike(postId: string) {
  try {
    // Get current user from session
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: { 
        userId_postId: { 
          userId, 
          postId 
        } 
      },
    });

    if (existingLike) {
      // Unlike: delete like and decrement count
      await prisma.$transaction([
        prisma.like.delete({ 
          where: { 
            userId_postId: { 
              userId, 
              postId 
            } 
          } 
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      
      // Don't revalidate to avoid scrolling - optimistic update handles UI
      // revalidatePath('/home');
      // revalidatePath(`/post/${postId}`);
      
      return { success: true, liked: false };
    } else {
      // Like: create like and increment count
      await prisma.$transaction([
        prisma.like.create({ 
          data: { 
            userId, 
            postId 
          } 
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      
      // Don't revalidate to avoid scrolling - optimistic update handles UI
      // revalidatePath('/home');
      // revalidatePath(`/post/${postId}`);
      
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

/**
 * Server Action: Toggle repost on a post
 * Requires authentication - gets userId from session
 */
export async function toggleRepost(postId: string) {
  try {
    // Get current user from session
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check if the post belongs to the current user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.authorId === userId) {
      return { success: false, error: "Cannot repost your own post" };
    }

    // Check if repost already exists
    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingRepost) {
      // Unrepost: delete repost and decrement count
      await prisma.$transaction([
        prisma.repost.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { repostCount: { decrement: 1 } },
        }),
      ]);

      // Don't revalidate to avoid scrolling - optimistic update handles UI
      // revalidatePath('/home');
      // revalidatePath(`/post/${postId}`);

      return { success: true, reposted: false };
    } else {
      // Repost: create repost and increment count
      await prisma.$transaction([
        prisma.repost.create({
          data: {
            userId,
            postId,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { repostCount: { increment: 1 } },
        }),
      ]);

      // Don't revalidate to avoid scrolling - optimistic update handles UI
      // revalidatePath('/home');
      // revalidatePath(`/post/${postId}`);

      return { success: true, reposted: true };
    }
  } catch (error) {
    console.error("Error toggling repost:", error);
    return { success: false, error: "Failed to toggle repost" };
  }
}

/**
 * Server Action: Toggle follow relationship
 */
export async function toggleFollow(targetUserID: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const currentUserId = session.user.id;

    // Find target user by userID
    const targetUser = await prisma.user.findUnique({
      where: { userID: targetUserID },
      select: { id: true },
    });

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    const targetUserId = targetUser.id;

    if (targetUserId === currentUserId) {
      return { success: false, error: "Cannot follow yourself" };
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow: delete follow relationship
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });

      // Revalidate relevant paths
      revalidatePath(`/profile/${targetUserID}`);
      revalidatePath("/home");
      
      return { success: true, following: false };
    } else {
      // Follow: create follow relationship
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });

      // Revalidate relevant paths
      revalidatePath(`/profile/${targetUserID}`);
      revalidatePath("/home");
      
      return { success: true, following: true };
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return { success: false, error: "Failed to toggle follow" };
  }
}

/**
 * Server Action: Check if current user is following target user
 */
export async function checkFollowingStatus(targetUserID: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { following: false };
    }

    const currentUserId = session.user.id;

    // Find target user by userID
    const targetUser = await prisma.user.findUnique({
      where: { userID: targetUserID },
      select: { id: true },
    });

    if (!targetUser) {
      return { following: false };
    }

    const targetUserId = targetUser.id;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    return { following: !!follow };
  } catch (error) {
    console.error("Error checking following status:", error);
    return { following: false };
  }
}

/**
 * Server Action: Check if user has liked/reposted/followed specific items
 */
export async function getUserInteractionStatus(
  userId: string,
  postIds: string[],
  targetUserId?: string,
) {
  try {
    // TODO: Implement Prisma queries for batch checking
    // const [likes, reposts, follow] = await Promise.all([
    //   prisma.like.findMany({
    //     where: { userId, postId: { in: postIds } },
    //     select: { postId: true },
    //   }),
    //   prisma.repost.findMany({
    //     where: { userId, postId: { in: postIds } },
    //     select: { postId: true },
    //   }),
    //   targetUserId
    //     ? prisma.follow.findUnique({
    //         where: {
    //           followerId_followingId: {
    //             followerId: userId,
    //             followingId: targetUserId,
    //           },
    //         },
    //       })
    //     : null,
    // ]);
    // 
    // return {
    //   likedPostIds: new Set(likes.map(l => l.postId)),
    //   repostedPostIds: new Set(reposts.map(r => r.postId)),
    //   following: !!follow,
    // };
    
    return {
      likedPostIds: new Set<string>(),
      repostedPostIds: new Set<string>(),
      following: false,
    };
  } catch (error) {
    console.error("Error checking interaction status:", error);
    return {
      likedPostIds: new Set<string>(),
      repostedPostIds: new Set<string>(),
      following: false,
    };
  }
}

