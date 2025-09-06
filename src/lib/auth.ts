// src/lib/auth.ts
import { getServerSession, type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getAuthSession();
  return !!session?.user?.email?.endsWith("@fetchrewards.com");
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) throw new Error("Authentication required");
  return session;
}
