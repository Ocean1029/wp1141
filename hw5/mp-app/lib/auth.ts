import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
      // Allow all sign-ins, but ensure each provider account creates a separate user
      // PrismaAdapter will handle account linking based on email by default
      // If you want to prevent linking, you can add custom logic here
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
});

