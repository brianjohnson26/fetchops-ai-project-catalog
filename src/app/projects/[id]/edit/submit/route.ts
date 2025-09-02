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
  const form = await req.formData();

  const title = String(form.get("title") || "");
  const description = String(form.get("description") || "");
  const team = String(form.get("team") || "");

  // Read owner (accept older field name too), trim and strip leading @
  const owner =
    String((form.get("owner") ?? form.get("ownerName")) || "")
      .trim()
      .replace(/^@+/, "");

  const hoursSavedPerWeek = Number(form.get("hoursSavedPerWeek") || 0);

  const selectedNames = form.getAll("toolNames").map((v) => String(v));
  const groups = ["llms", "automation", "data", "apps", "fetch"];
  const otherNames = groups.flatMap((g) =>
    String(form.get(`other_${g}`) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const allToolNames = Array.from(new Set([...selectedNames, ...otherNames]));

  const links: { type: string; url: string }[] = [];
  for (let i = 1; i <= 3; i++) {
    const url = String(form.get(`link_url_${i}`) || "").trim();
    const type = String(form.get(`link_type_${i}`) || "Other").trim() || "Other";
    if (url) links.push({ type, url });
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      description,
      team,
      owner,
      hoursSavedPerWeek,
      tools: {
        deleteMany: {},
        create: allToolNames.map((name) => ({
          tool: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      },
      links: { deleteMany: {}, create: links },
    },
  });

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const origin = `${proto}://${host}`;
  return NextResponse.redirect(new URL(`/projects/${projectId}?ok=1`, origin), 303);
}
