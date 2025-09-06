import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    GOOGLE_CLIENT_ID_len: process.env.GOOGLE_CLIENT_ID?.length ?? 0,
    GOOGLE_CLIENT_SECRET_len: process.env.GOOGLE_CLIENT_SECRET?.length ?? 0,
  });
}
