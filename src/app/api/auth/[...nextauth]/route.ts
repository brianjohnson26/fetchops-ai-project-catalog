// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const handler = NextAuth({
  // ✅ Minimal, known-good config. No custom pages or extras.
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // Allow relative callbackUrl like /admin
  // (No `pages` overrides; no callbacks; nothing else.)
});

export { handler as GET, handler as POST };
