"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateUserId, sanitizeUserId } from "@/lib/utils/userId";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Register a new user with a userID
 * This updates the existing user record created by NextAuth with the custom userID
 */
export async function registerWithUserId(userId: string) {
  try {
    // Get current session
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate and sanitize userID
    const sanitized = sanitizeUserId(userId);
    const validation = validateUserId(sanitized);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check if userID is already taken
    // Type assertion needed until Prisma Client is regenerated with userID field
    const existingUser = await (prisma.user as any).findUnique({
      where: { userID: sanitized },
    });
    
    if (existingUser) {
      return { success: false, error: "User ID already taken" };
    }

    // Check if current user already has a userID
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if ((currentUser as { userID?: string | null })?.userID) {
      return { success: false, error: "User ID already registered" };
    }

    // Update user with userID
    // Type assertion needed until Prisma Client is regenerated with userID field
    const user = await (prisma.user as any).update({
      where: { id: session.user.id },
      data: {
        userID: sanitized,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/register");
    revalidatePath("/home");

    return { success: true, user };
  } catch (error) {
    console.error("Error registering user:", error);
    // Handle Prisma unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, error: "User ID already taken" };
    }
    return { success: false, error: "Failed to register user" };
  }
}

/**
 * Server Action: Get user profile by userID
 */
export async function getUserProfile(userId: string) {
  try {
    // Type assertion needed until Prisma Client is regenerated with userID field
    const user = await (prisma.user as any).findUnique({
      where: { userID: userId },
      include: {
        _count: {
          select: {
            posts: { where: { deletedAt: null, isDraft: false } },
            followers: true,
            following: true,
          },
        },
      },
    });
    
    if (!user) {
      return null;
    }
    
    const userWithID = user as { userID: string | null } & typeof user;
    
    return {
      id: user.id,
      userId: userWithID.userID ?? "",
      name: user.name,
      email: user.email,
      imageUrl: (user as { image?: string | null }).image ?? undefined,
      bannerUrl: user.bannerUrl,
      bio: user.bio,
      postsCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Server Action: Update user profile
 */
export async function updateUserProfile(
  data: {
    bio?: string;
    bannerUrl?: string;
  },
) {
  try {
    // Get current session
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    // Revalidate profile page if userID exists
    const userWithID = user as { userID?: string | null };
    if (userWithID.userID) {
      revalidatePath(`/profile/${userWithID.userID}`);
    }
    
    return { success: true, user };
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

    // Check if userID is already taken
    // Type assertion needed until Prisma Client is regenerated with userID field
    const existingUser = await (prisma.user as any).findUnique({
      where: { userID: sanitized },
    });
    
    return {
      available: !existingUser,
      error: existingUser ? "User ID already taken" : undefined,
    };
  } catch (error) {
    console.error("Error checking user ID availability:", error);
    return { available: false, error: "Failed to check availability" };
  }
}

