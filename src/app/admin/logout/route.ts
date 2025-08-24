import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const origin = `${proto}://${host}`;

  const res = NextResponse.redirect(new URL("/", origin), 303);
  res.cookies.set({
    name: "admin_session",
    value: "",
    path: "/",
    maxAge: 0,
  });
  return res;
}
