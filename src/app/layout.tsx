import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fetch AI Project Catalog",
  description: "Internal catalog of implemented AI projects at Fetch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <nav className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold">Dashboard</Link>
            <Link href="/projects" className="">Browse</Link>
            <Link href="/experts" className="">Find an expert</Link>
            <Link href="/projects/new" className="ml-auto rounded bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700">Add Project</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-4">{children}</main>
        <footer className="mx-auto max-w-5xl p-4 text-sm text-gray-500">© Fetch</footer>
      </body>
    </html>
  );
}
