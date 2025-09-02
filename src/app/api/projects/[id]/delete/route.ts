
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
    // Delete the project and all related records
    await prisma.project.delete({
      where: { id },
    });

    // Redirect back to projects list
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("x-forwarded-host") || request.nextUrl.host;
    const origin = `${proto}://${host}`;
    
    return NextResponse.redirect(new URL("/projects?deleted=1", origin), 303);
  } catch (error) {
    console.error("Failed to delete project:", error);
    return new NextResponse("Failed to delete project", { status: 500 });
  }
}
