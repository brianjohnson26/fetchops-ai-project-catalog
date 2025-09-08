// src/app/projects/new/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewProject } from "@/lib/slack"; // 🟣 NEW
import { requireAdmin } from "@/lib/auth";

async function isAdmin() {
  return await requireAdmin();
}

export async function POST(req: NextRequest) {
  try {
    console.log("New project submission started");

    if (!(await isAdmin())) {
      console.log("User not authenticated as admin");
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
      const origin = `${proto}://${host}`;
      return NextResponse.redirect(new URL("/admin?err=signin", origin), 303);
    }

    const form = await req.formData();

    const title = String(form.get("title") || "").trim();

    // 🔒 Server-side 300-char limit for Description
    const rawDesc = String(form.get("description") || "");
    const description = rawDesc.trim();
    if (description.length > 300) {
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
      const origin = `${proto}://${host}`;
      // Redirect back to form with a friendly error code + length for UI
      return NextResponse.redirect(
        new URL(`/projects/new?error=descTooLong&len=${description.length}`, origin),
        303
      );
    }

    const team = String(form.get("team") || "").trim();

    // Read owner (accepts older "ownerName"), trim and strip leading @
    const owner = String((form.get("owner") ?? form.get("ownerName")) || "")
      .trim()
      .replace(/^@+/, "");

    // Normalize number input
    const hoursSavedPerWeek = Math.max(
      0,
      Number.isFinite(Number(form.get("hoursSavedPerWeek")))
        ? Number(form.get("hoursSavedPerWeek"))
        : 0
    );

    // Parse deployment date (optional)
    const deploymentDateStr = String(form.get("deploymentDate") || "").trim();
    const deploymentDate = deploymentDateStr ? new Date(deploymentDateStr) : undefined;

    // NEW FIELDS
    const howYouBuiltIt = String(form.get("howYouBuiltIt") || "").trim() || null;
    const challengesSolutionsTips =
      String(form.get("challengesSolutionsTips") || "").trim() || null;
    const otherImpacts = String(form.get("otherImpacts") || "").trim() || null;
    const nextSteps = String(form.get("nextSteps") || "").trim() || null;

    // Tools from checkboxes + freeform
    const selectedNames = form.getAll("toolNames").map((v) => String(v));
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

    // Create the project
    console.log("Creating project with data:", { title, description, team, owner, deploymentDate });

    const created = await prisma.project.create({
      data: {
        title,
        description, // already trimmed and validated
        team,
        owner, // stored as the owner name
        hoursSavedPerWeek,
        deploymentDate,
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

    console.log("Project created successfully with ID:", created.id);

    // Re-read minimal fields incl. tool names and links for Slack message
    const forSlack = await prisma.project.findUnique({
      where: { id: Number(created.id) },
      select: {
        id: true,
        title: true,
        team: true,
        owner: true,
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
        // summary: description, // uncomment if your Slack helper expects/uses it
        tools: forSlack.tools,
        links: forSlack.links,
      });
    }

    // Force revalidation of cache after creating a project
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");
      revalidatePath("/projects");
      revalidatePath("/api/home-stats");
      console.log("Revalidated cache for home, projects, and home-stats after project creation");
    } catch (error) {
      console.log("Cache revalidation not available or failed:", error);
    }

    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    console.log("Redirecting to projects page with success");
    return NextResponse.redirect(new URL("/projects?ok=1", origin), 303);
  } catch (error) {
    console.error("Error creating project:", error);
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(new URL("/projects/new?error=1", origin), 303);
  }
}
