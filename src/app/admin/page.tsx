
import { getAuthSession } from "@/lib/auth";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getAuthSession();
  const isAdmin = session?.user?.email?.endsWith("@fetchrewards.com");

  if (isAdmin) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="small">
          {session?.user ? (
            <>Signed in as {session.user.email} ({session.user.name})</>
          ) : (
            <>Not signed in</>
          )}
        </p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <Link href="/projects/new" className="button">Add Project</Link>
          <form method="POST" action="/api/auth/signout" style={{ display: 'inline' }}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="text-xl font-semibold">Admin sign-in</h1>
      <p className="small">
        Sign in with your @fetchrewards.com Google account
      </p>
      <div style={{ marginTop: 12 }}>
        <form method="post" action="/api/auth/signin/google" style={{ display: "inline" }}>
          <input type="hidden" name="callbackUrl" value="/admin" />
          <button type="submit" className="button">Sign in with Google</button>
        </form>
      </div>
    </div>
  );
}
