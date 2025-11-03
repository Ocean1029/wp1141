"use server";

/* eslint-disable @typescript-eslint/no-unused-vars */

// TODO: Import Prisma client when database is set up
// import { prisma } from "@/lib/prisma";

/**
 * Server Action: Fetch all posts for "All" feed
 */
export async function getAllPosts() {
  try {
    // TODO: Implement Prisma query
    // const posts = await prisma.post.findMany({
    //   where: { deletedAt: null, isDraft: false },
    //   include: {
    //     author: { select: { userId: true, name: true, imageUrl: true } },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });
    // return posts;
    
    return [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

/**
 * Server Action: Fetch posts from followed users
 */
export async function getFollowingPosts(userId: string) {
  try {
    // TODO: Implement Prisma query with joins
    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    //   include: { following: { select: { followingId: true } } },
    // });
    // const followingIds = user?.following.map(f => f.followingId) || [];
    // const posts = await prisma.post.findMany({
    //   where: {
    //     authorId: { in: followingIds },
    //     deletedAt: null,
    //     isDraft: false,
    //   },
    //   include: {
    //     author: { select: { userId: true, name: true, imageUrl: true } },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });
    // return posts;
    
    return [];
  } catch (error) {
    console.error("Error fetching following posts:", error);
    return [];
  }
}

/**
 * Server Action: Create a new post
 */
export async function createPost(
  authorId: string,
  text: string,
  parentId?: string,
  isDraft: boolean = false,
) {
  try {
    // TODO: Implement Prisma create with transaction
    // const post = await prisma.post.create({
    //   data: {
    //     authorId,
    //     text,
    //     parentId,
    //     isDraft,
    //   },
    //   include: {
    //     author: { select: { userId: true, name: true, imageUrl: true } },
    //   },
    // });
    // 
    // // Revalidate relevant paths
    // revalidatePath('/home');
    // if (parentId) {
    //   revalidatePath(`/post/${parentId}`);
    // }
    // 
    // return { success: true, post };
    
    return { success: false, error: "Not implemented" };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

/**
 * Server Action: Delete a post (soft delete)
 */
export async function deletePost(postId: string, userId: string) {
  try {
    // TODO: Implement Prisma update with permission check
    // const post = await prisma.post.findUnique({ where: { id: postId } });
    // if (!post || post.authorId !== userId) {
    //   return { success: false, error: "Unauthorized" };
    // }
    // await prisma.post.update({
    //   where: { id: postId },
    //   data: { deletedAt: new Date() },
    // });
    // 
    // revalidatePath('/home');
    // if (post.parentId) {
    //   revalidatePath(`/post/${post.parentId}`);
    // }
    // 
    // return { success: true };
    
    return { success: false, error: "Not implemented" };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

/**
 * Server Action: Fetch a single post with its replies
 */
export async function getPostWithReplies(postId: string) {
  try {
    // TODO: Implement Prisma query with nested replies
    // const post = await prisma.post.findUnique({
    //   where: { id: postId },
    //   include: {
    //     author: { select: { userId: true, name: true, imageUrl: true } },
    //     replies: {
    //       include: {
    //         author: { select: { userId: true, name: true, imageUrl: true } },
    //       },
    //       orderBy: { createdAt: 'asc' },
    //     },
    //   },
    // });
    // return post;
    
    return null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

/**
 * Server Action: Get user's liked posts
 */
export async function getLikedPosts(userId: string) {
  try {
    // TODO: Implement Prisma query
    // const likes = await prisma.like.findMany({
    //   where: { userId },
    //   include: {
    //     post: {
    //       include: {
    //         author: { select: { userId: true, name: true, imageUrl: true } },
    //       },
    //     },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });
    // return likes.map(like => like.post);
    
    return [];
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
}

