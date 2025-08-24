import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === "1";
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(new URL(`/admin?err=signin`, origin), 303);
  }

  const projectId = Number(params.id);
  await prisma.link.deleteMany({ where: { projectId } });
  await prisma.projectTool.deleteMany({ where: { projectId } });
  await prisma.project.delete({ where: { id: projectId } });

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const origin = `${proto}://${host}`;
  return NextResponse.redirect(new URL(`/projects?deleted=1`, origin), 303);
}
