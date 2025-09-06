
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tools: { include: { tool: true } },
        links: true,
        people: { include: { person: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ 
        exists: false, 
        id,
        message: "Project not found in database" 
      });
    }

    return NextResponse.json({
      exists: true,
      project: {
        id: project.id,
        title: project.title,
        team: project.team,
        owner: project.owner,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        toolsCount: project.tools.length,
        linksCount: project.links.length,
        peopleCount: project.people.length,
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Database error", 
      details: String(error) 
    }, { status: 500 });
  }
}
