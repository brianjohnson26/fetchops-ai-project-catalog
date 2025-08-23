import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function requireAdmin(key: string | null | undefined) {
  const expected = process.env.ADMIN_KEY || "changeme";
  return key === expected;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const adminKey = String(form.get("adminKey") || "");
  if (!requireAdmin(adminKey)) {
    return NextResponse.redirect(new URL("/projects/new?err=Invalid+admin+key", req.url));
  }

  const title = String(form.get("title") || "");
  const description = String(form.get("description") || "");
  const team = String(form.get("team") || "");
  const slackHandle = String(form.get("slackHandle") || "");
  const hoursSavedPerWeek = Number(form.get("hoursSavedPerWeek") || 0);
  const toolIds = form.getAll("toolIds").map(v => Number(v));

  await prisma.project.create({
    data: {
      title, description, team, slackHandle, hoursSavedPerWeek,
      tools: { create: toolIds.map(id => ({ tool: { connect: { id } } })) }
    }
  });

  return NextResponse.redirect(new URL("/projects", req.url));
}
