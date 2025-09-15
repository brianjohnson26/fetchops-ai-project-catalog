// src/app/projects/[id]/edit/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TEAMS } from "@/lib/constants";

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
  if (!Number.isFinite(projectId)) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(new URL(`/projects?error=badId`, origin), 303);
  }

  const form = await req.formData();

  // Required basics
  const title = String(form.get("title") || "").trim();
  if (!title) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(new URL(`/projects/${projectId}/edit?error=missingTitle`, origin), 303);
  }

  // Description with server-side length cap
  const description = String(form.get("description") || "").trim();
  if (description.length > 300) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(
      new URL(`/projects/${projectId}/edit?error=descTooLong&len=${description.length}`, origin),
      303
    );
  }

  // Team must be one of TEAMS
  const team = String(form.get("team") || "").trim();
  if (!team || !TEAMS.includes(team as (typeof TEAMS)[number])) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(new URL(`/projects/${projectId}/edit?error=invalidTeam`, origin), 303);
  }

  // Owner (accepts older field name)
  const owner = String((form.get("owner") ?? form.get("ownerName")) || "")
    .trim()
    .replace(/^@+/, "");
  if (!owner) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(new URL(`/projects/${projectId}/edit?error=missingOwner`, origin), 303);
  }

  // Hours — normalize to non-negative integer
  const hoursRaw = Number(form.get("hoursSavedPerWeek"));
  const hoursSavedPerWeek =
    Number.isFinite(hoursRaw) && hoursRaw > 0 ? Math.floor(hoursRaw) : 0;

  // Deployment date — optional
  const deploymentDateStr = String(form.get("deploymentDate") || "").trim();
  let deploymentDate: Date | null = null;
  if (deploymentDateStr) {
    const parsed = new Date(deploymentDateStr);
    if (!isNaN(parsed.getTime())) deploymentDate = parsed;
  }

  // Optional long-form fields
  const howYouBuiltIt = (String(form.get("howYouBuiltIt") || "").trim() || null);
  const challengesSolutionsTips = (String(form.get("challengesSolutionsTips") || "").trim() || null);
  const otherImpacts = (String(form.get("otherImpacts") || "").trim() || null);
  const nextSteps = (String(form.get("nextSteps") || "").trim() || null);
  const otherNotes = (String(form.get("otherNotes") || "").trim() || null);

  // Tools from checkboxes + freeform
  const selectedNames = form.getAll("toolNames").map((v) => String(v).trim()).filter(Boolean);
  const otherNames = String(form.get("other_tools") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allToolNames = Array.from(new Set([...selectedNames, ...otherNames]));

  // Links (up to 3)
  const links: { type: string; url: string }[] = [];
  for (let i = 1; i <= 3; i++) {
    const url = String(form.get(`link_url_${i}`) || "").trim();
    const type = String(form.get(`link_type_${i}`) || "Other").trim() || "Other";
    if (url) links.push({ type, url });
  }

  // Update project
  await prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      description,
      team,
      owner,
      hoursSavedPerWeek,
      deploymentDate, // null if empty/invalid
      howYouBuiltIt,
      challengesSolutionsTips,
      otherImpacts,
      nextSteps,
      otherNotes,
      tools: {
        deleteMany: {},
        create: allToolNames.map((name) => ({
          tool: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      },
      links: { deleteMany: {}, create: links },
    },
  });

  // Revalidate pages that show project info
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
  } catch (e) {
    console.log("Revalidation not available or failed:", e);
  }

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const origin = `${proto}://${host}`;
  return NextResponse.redirect(new URL(`/projects/${projectId}?ok=1`, origin), 303);
}
