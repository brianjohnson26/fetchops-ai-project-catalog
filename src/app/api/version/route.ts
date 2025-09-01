import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    app: 'fetch-ai-project-catalog',
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
}
