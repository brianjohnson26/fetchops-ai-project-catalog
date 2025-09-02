import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === "1";
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(new URL("/admin?err=signin", origin), 303);
  }

  const form = await req.formData();

  const title = String(form.get("title") || "");
  const description = String(form.get("description") || "");
  const team = String(form.get("team") || "");
  // ✅ read the Owner Name field and store it in the same DB column
  const ownerName = String(form.get("ownerName") || "").trim().replace(/^@+/, "");
  const slackHandle = ownerName;
  const hoursSavedPerWeek = Number(form.get("hoursSavedPerWeek") || 0);

  // ✅ NEW FIELDS
  const howYouBuiltIt = form.get("howYouBuiltIt")?.toString() || null;
  const challengesSolutionsTips = form.get("challengesSolutionsTips")?.toString() || null;
  const otherImpacts = form.get("otherImpacts")?.toString() || null;

  // tools from checkboxes + freeform
  const selectedNames = form.getAll("toolNames").map((v) => String(v));
  const groups = ["llms", "automation", "data", "apps", "fetch"];
  const otherNames = groups.flatMap((g) =>
    String(form.get(`other_${g}`) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const allToolNames = Array.from(new Set([...selectedNames, ...otherNames]));

  // links (up to 3)
  const links: { type: string; url: string }[] = [];
  for (let i = 1; i <= 3; i++) {
    const url = String(form.get(`link_url_${i}`) || "").trim();
    const type = String(form.get(`link_type_${i}`) || "Other").trim() || "Other";
    if (url) links.push({ type, url });
  }

  await prisma.project.create({
    data: {
      title,
      description,
      team,
      slackHandle, // stored as the owner name
      hoursSavedPerWeek,
      // ✅ include new fields in the DB record
      howYouBuiltIt,
      challengesSolutionsTips,
      otherImpacts,
      tools: {
        create: allToolNames.map((name) => ({
          tool: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      },
      links: { create: links },
    },
  });

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const origin = `${proto}://${host}`;
  return NextResponse.redirect(new URL("/projects/new?ok=1", origin), 303);
}
