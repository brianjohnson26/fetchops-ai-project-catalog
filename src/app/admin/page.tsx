import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";

export default async function AdminPage() {
  const session = await getAuthSession();
  const isAdmin = session?.user?.email?.endsWith("@fetchrewards.com");

  async function handleSignOut() {
    "use server";
    redirect("/api/auth/signout");
  }

  async function handleSignIn() {
    "use server";
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

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
        <form action={handleSignOut} style={{ marginTop: 12 }}>
          <button type="submit">Sign out</button>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="text-xl font-semibold">Admin sign-in</h1>
      <p className="small">
        Sign in with your @fetchrewards.com Google account
      </p>
      <form action={handleSignIn} style={{ marginTop: 12 }}>
        <button type="submit">Sign in with Google</button>
      </form>
    </div>
  );
}