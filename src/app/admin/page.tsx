import { getAuthSession } from "@/lib/auth";
import { signIn, signOut } from "next-auth/react";

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
        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }} style={{ marginTop: 12 }}>
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
      <form action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/admin" });
      }} style={{ marginTop: 12 }}>
        <button type="submit">Sign in with Google</button>
      </form>
    </div>
  );
}