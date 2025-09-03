
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get a recent project to check the text fields
    const project = await prisma.project.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        howYouBuiltIt: true,
        challengesSolutionsTips: true,
        otherImpacts: true,
      }
    });

    if (!project) {
      return NextResponse.json({ error: "No projects found" });
    }

    // Return the raw data with line breaks visible
    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title,
        description: {
          raw: project.description,
          hasLineBreaks: project.description.includes('\n'),
          lineCount: project.description.split('\n').length
        },
        howYouBuiltIt: project.howYouBuiltIt ? {
          raw: project.howYouBuiltIt,
          hasLineBreaks: project.howYouBuiltIt.includes('\n'),
          lineCount: project.howYouBuiltIt.split('\n').length
        } : null,
        challengesSolutionsTips: project.challengesSolutionsTips ? {
          raw: project.challengesSolutionsTips,
          hasLineBreaks: project.challengesSolutionsTips.includes('\n'),
          lineCount: project.challengesSolutionsTips.split('\n').length
        } : null,
        otherImpacts: project.otherImpacts ? {
          raw: project.otherImpacts,
          hasLineBreaks: project.otherImpacts.includes('\n'),
          lineCount: project.otherImpacts.split('\n').length
        } : null,
      }
    }, { 
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return NextResponse.json({ error: "Database error", details: String(error) });
  }
}
