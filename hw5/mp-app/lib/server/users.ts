"use server";

/* eslint-disable @typescript-eslint/no-unused-vars */

// TODO: Import Prisma client when database is set up
// import { prisma } from "@/lib/prisma";
import { validateUserId, sanitizeUserId } from "@/lib/utils/userId";

/**
 * Server Action: Register a new user with a userID
 */
export async function registerWithUserId(
  userId: string,
  oauthData: {
    email: string;
    name: string;
    imageUrl?: string;
    provider: string;
    providerId: string;
  },
) {
  try {
    const sanitized = sanitizeUserId(userId);
    const validation = validateUserId(sanitized);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // TODO: Implement Prisma create with uniqueness check
    // const existingUser = await prisma.user.findUnique({
    //   where: { userId: sanitized },
    // });
    // 
    // if (existingUser) {
    //   return { success: false, error: "User ID already taken" };
    // }
    // 
    // const user = await prisma.user.create({
    //   data: {
    //     userId: sanitized,
    //     email: oauthData.email,
    //     name: oauthData.name,
    //     imageUrl: oauthData.imageUrl,
    //     provider: oauthData.provider,
    //     providerId: oauthData.providerId,
    //   },
    // });
    // 
    // return { success: true, user };
    
    return { success: false, error: "Not implemented" };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: "Failed to register user" };
  }
}

/**
 * Server Action: Get user profile by userID
 */
export async function getUserProfile(userId: string) {
  try {
    // TODO: Implement Prisma query with counts
    // const user = await prisma.user.findUnique({
    //   where: { userId },
    //   include: {
    //     _count: {
    //       select: {
    //         posts: { where: { deletedAt: null, isDraft: false } },
    //         followers: true,
    //         following: true,
    //       },
    //     },
    //   },
    // });
    // 
    // if (!user) {
    //   return null;
    // }
    // 
    // return {
    //   id: user.id,
    //   userId: user.userId,
    //   name: user.name,
    //   email: user.email,
    //   imageUrl: user.imageUrl,
    //   bannerUrl: user.bannerUrl,
    //   bio: user.bio,
    //   postsCount: user._count.posts,
    //   followersCount: user._count.followers,
    //   followingCount: user._count.following,
    // };
    
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Server Action: Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    bio?: string;
    bannerUrl?: string;
  },
) {
  try {
    // TODO: Implement Prisma update
    // const user = await prisma.user.update({
    //   where: { id: userId },
    //   data,
    // });
    // 
    // revalidatePath(`/profile/${user.userId}`);
    // 
    // return { success: true, user };
    
    return { success: false, error: "Not implemented" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Server Action: Check if userID is available
 */
export async function checkUserIdAvailability(userId: string) {
  try {
    const sanitized = sanitizeUserId(userId);
    const validation = validateUserId(sanitized);
    
    if (!validation.valid) {
      return { available: false, error: validation.error };
    }

    // TODO: Implement Prisma check
    // const existingUser = await prisma.user.findUnique({
    //   where: { userId: sanitized },
    // });
    // 
    // return {
    //   available: !existingUser,
    //   error: existingUser ? "User ID already taken" : undefined,
    // };
    
    return { available: true };
  } catch (error) {
    console.error("Error checking user ID availability:", error);
    return { available: false, error: "Failed to check availability" };
  }
}

