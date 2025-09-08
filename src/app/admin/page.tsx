import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { callbackUrl?: string };
};

export default async function AdminPage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  const isAdmin = !!session?.user?.email?.endsWith("@fetchrewards.com");

  // Only allow same-site, relative callback targets.
  const raw = searchParams?.callbackUrl ?? "/";
  const callbackSafe =
    typeof raw === "string" && raw.startsWith("/") ? raw : "/";

  // ✅ Already signed in? Go straight to the intended page (Dashboard by default).
  if (isAdmin) {
    redirect(callbackSafe);
  }

  // Not signed in yet → show Google sign-in.
  return (
    <div className="card">
      <h1 className="text-xl font-semibold">Admin sign-in</h1>
      <p className="small">Sign in with your @fetchrewards.com Google account</p>

      <div style={{ marginTop: 12 }}>
        {/* POST so NextAuth handles the callbackUrl on the server */}
        <form method="post" action="/api/auth/signin/google" style={{ display: "inline" }}>
          <input type="hidden" name="callbackUrl" value={callbackSafe} />
          <button type="submit" className="button">Sign in with Google</button>
        </form>
      </div>
    </div>
  );
}
