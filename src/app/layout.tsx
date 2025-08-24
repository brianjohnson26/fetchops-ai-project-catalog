import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = cookies().get("admin_session")?.value === "1";

  return (
    <html lang="en">
      <body>
        <header>
          <nav className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold">Dashboard</Link>
            <Link href="/projects">Browse</Link>
            <Link href="/experts">Find an expert</Link>
            <span className="spacer" />
            {!isAdmin ? (
              <Link href="/admin">Log in</Link>
            ) : (
              <>
                <Link href="/projects/new" className="add-cta">+ Add Project</Link>
                <form method="POST" action="/admin/logout" style={{ marginLeft: 8 }}>
                  <button type="submit" className="btn-link">Log out</button>
                </form>
              </>
            )}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
