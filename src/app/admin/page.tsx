import { cookies } from "next/headers";

export default function AdminPage() {
  const isAdmin = cookies().get("admin_session")?.value === "1";

  if (isAdmin) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="small">You’re signed in as admin. Session lasts ~8 hours.</p>
        <form method="POST" action="/admin/logout" style={{ marginTop: 12 }}>
          <button type="submit">Sign out</button>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="text-xl font-semibold">Admin sign-in</h1>
      <form method="POST" action="/admin/login" style={{ marginTop: 12 }}>
        <label>
          Admin key
          <input name="key" placeholder="enter admin key" required />
        </label>
        <div style={{ marginTop: 10 }}>
          <button type="submit">Sign in</button>
        </div>
      </form>
    </div>
  );
}
