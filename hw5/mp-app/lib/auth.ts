import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set. Please set it in your environment variables.");
}

if (!process.env.NEXTAUTH_URL) {
  console.warn("NEXTAUTH_URL is not set. This may cause issues in production.");
}

// Custom adapter wrapper to prevent account linking for same email different providers
// This ensures each provider account creates a separate user, even if email is the same
function createCustomAdapter(baseAdapter: Adapter): Adapter {
  return {
    ...baseAdapter,
    async getUserByEmail(email) {
      // Return null to prevent account linking based on email alone
      // This forces creation of a new user for each provider
      return null;
    },
  };
}

const baseAdapter = PrismaAdapter(prisma);
const customAdapter = createCustomAdapter(baseAdapter);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: customAdapter,
  session: {
    strategy: "database",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all sign-ins - custom adapter will handle user creation
      return true;
    },
    async session({ session, user }) {
      // Fetch user with userID from database
      // Note: userID field will be available after Prisma Client regeneration
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (session.user) {
        session.user.id = user.id;
        // Add userID to session for registration check (may be null if not yet registered)
        // Type assertion needed until Prisma Client is regenerated
        session.user.userID = (dbUser as { userID?: string | null })?.userID ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Explicitly set trustHost for Vercel deployment
  trustHost: true,
  // Configure cookies for production environment
  // This ensures PKCE code verifier is properly stored and retrieved
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Host-" : ""}authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },
});

