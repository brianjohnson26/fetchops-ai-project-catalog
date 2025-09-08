import { withAuth } from "next-auth/middleware";

/**
 * Require authentication for all pages except:
 * - /api/** (API routes)
 * - /_next/** (Next.js assets)
 * - /static/**, /public/** (static assets)
 * - /admin (your sign-in helper page)
 * - /health, favicon, robots, sitemap (infra/SEO)
 */
export default withAuth({
  pages: {
    signIn: "/admin", // unauthenticated users will be sent here
  },
  callbacks: {
    authorized: ({ token }) => !!token, // only allow if a session exists
  },
});

export const config = {
  matcher: [
    "/((?!api|_next|static|public|admin|favicon.ico|health|robots.txt|sitemap.xml).*)",
  ],
};
