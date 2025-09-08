import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  const isAdmin = !!session?.user?.email?.endsWith("@fetchrewards.com");
  
  if (!isAdmin) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(new URL(`/admin?err=signin`, origin), 303);
  }

  const projectId = Number(params.id);
  const form = await req.formData();

  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();
  const team = String(form.get("team") || "").trim();

  // Read owner (accept older field name too), trim and strip leading @
  const owner =
    String((form.get("owner") ?? form.get("ownerName")) || "")
      .trim()
      .replace(/^@+/, "");

  const hoursSavedPerWeek = Number(form.get("hoursSavedPerWeek") || 0);

  // Additional fields
  const howYouBuiltIt = String(form.get("howYouBuiltIt") || "").trim() || null;
  const challengesSolutionsTips = String(form.get("challengesSolutionsTips") || "").trim() || null;
  const otherImpacts = String(form.get("otherImpacts") || "").trim() || null;
  const nextSteps = String(form.get("nextSteps") || "").trim() || null;

  const selectedNames = form.getAll("toolNames").map((v) => String(v));
  const otherNames = String(form.get("other_tools") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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
      howYouBuiltIt,
      challengesSolutionsTips,
      otherImpacts,
      nextSteps,
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