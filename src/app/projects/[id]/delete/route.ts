
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  
  if (isNaN(id)) {
    return notFound();
  }

  try {
    // First, check if the project exists
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tools: true,
        links: true,
        people: true,
      },
    });

    if (!project) {
      console.log(`Project ${id} not found for deletion`);
      return new NextResponse("Project not found", { status: 404 });
    }

    console.log(`Attempting to delete project ${id}: "${project.title}"`);
    console.log(`Project has ${project.tools.length} tools, ${project.links.length} links, ${project.people.length} people`);

    // Delete the project and all related records (should cascade)
    const deleted = await prisma.project.delete({
      where: { id },
    });

    console.log(`Successfully deleted project ${id}`);

    // Redirect back to projects list
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("x-forwarded-host") || request.nextUrl.host;
    const origin = `${proto}://${host}`;
    
    return NextResponse.redirect(new URL("/projects?deleted=1", origin), 303);
  } catch (error) {
    console.error(`Failed to delete project ${id}:`, error);
    
    // Log the specific error details
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
    }
    
    return new NextResponse(`Failed to delete project: ${error}`, { status: 500 });
  }
}
