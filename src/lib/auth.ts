import { getServerSession } from "next-auth";
import { authOptions } from "./auth-config";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email?.endsWith("@fetchrewards.com") || false;
}

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}