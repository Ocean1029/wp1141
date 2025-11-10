import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userID: string | null;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

