
import "./globals.css";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  const isAdmin = session?.user?.email?.endsWith("@fetchrewards.com");

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico?v=12" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=12" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=12" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
      </head>
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
                <form method="POST" action="/api/auth/signout" style={{ marginLeft: 8 }}>
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
