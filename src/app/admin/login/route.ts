import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const key = String(form.get("key") || "");
  const expected = process.env.ADMIN_KEY || "fetchops";

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const origin = `${proto}://${host}`;

  if (key !== expected) {
    return NextResponse.redirect(new URL("/admin?err=1", origin), 303);
  }

  const res = NextResponse.redirect(new URL("/", origin), 303);
  res.cookies.set({
    name: "admin_session",
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
