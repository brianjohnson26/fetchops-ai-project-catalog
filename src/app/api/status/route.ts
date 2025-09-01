import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // shared client

export async function GET() {
  try {
    const projects = await prisma.project.count();
    return NextResponse.json({ ok: true, db: 'up', projects });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, db: 'down', error: err?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}
