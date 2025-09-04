import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewProject } from "@/lib/slack"; // 🟣 NEW

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
  // Read owner (accepts older "ownerName" too), trim and strip leading @
  const owner =
    String((form.get("owner") ?? form.get("ownerName")) || "")
      .trim()
      .replace(/^@+/, "");
  const hoursSavedPerWeek = Number(form.get("hoursSavedPerWeek") || 0);

  // NEW FIELDS
  const howYouBuiltIt = String(form.get("howYouBuiltIt") || "").trim() || null;
  const challengesSolutionsTips =
    String(form.get("challengesSolutionsTips") || "").trim() || null;
  const otherImpacts = String(form.get("otherImpacts") || "").trim() || null;
  const nextSteps = String(form.get("nextSteps") || "").trim() || null;

  // tools from checkboxes + freeform
  const selectedNames = form.getAll("toolNames").map((v) => String(v));
  const otherNames = String(form.get("other_tools") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allToolNames = Array.from(new Set([...selectedNames, ...otherNames]));

  // links (up to 3)
  const links: { type: string; url: string }[] = [];
  for (let i = 1; i <= 3; i++) {
    const url = String(form.get(`link_url_${i}`) || "").trim();
    const type = String(form.get(`link_type_${i}`) || "Other").trim() || "Other";
    if (url) links.push({ type, url });
  }

  // Create the project
  const created = await prisma.project.create({
    data: {
      title,
      description,
      team,
      owner, // stored as the owner name
      hoursSavedPerWeek,
      // include new fields in the DB record
      howYouBuiltIt,
      challengesSolutionsTips,
      otherImpacts,
      nextSteps,
      tools: {
        create: allToolNames.map((name) => ({
          tool: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      },
      links: { create: links },
    },
    select: { id: true }, // grab the id so we can re-read for Slack
  });

  // Re-read minimal fields incl. tool names and links for Slack message
  const forSlack = await prisma.project.findUnique({
    where: { id: Number(created.id) },
    select: {
      id: true,
      title: true,
      team: true,
      owner: true,
      // your Slack helper treats summary as optional; use description if you want:
      // summary: true, // uncomment if your schema has it
      tools: { select: { tool: { select: { name: true } } } },
      links: { select: { type: true, url: true } },
    },
  });

  if (forSlack) {
    await notifyNewProject({
      id: String(forSlack.id),
      title: forSlack.title,
      team: forSlack.team,
      owner: forSlack.owner,
      // If you prefer sending description as "summary" in Slack:
      // summary: description,
      tools: forSlack.tools,
      links: forSlack.links,
    });
  }

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const origin = `${proto}://${host}`;
  return NextResponse.redirect(new URL("/projects?ok=1", origin), 303);
}
