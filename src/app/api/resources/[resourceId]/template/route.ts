import { NextRequest } from "next/server";
import { prisma } from "@/server/infrastructure/prisma/client";
import { generateData } from "@/server/actions/resources";

type RouteParams = {
  params: Promise<{
    resourceId: string;
  }>;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { resourceId } = await params;
    const { template, count } = await request.json();

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        project: true,
      },
    });

    if (!resource) {
      return Response.json({ error: "Resource not found" }, { status: 404 });
    }

    await prisma.resource.update({
      where: { id: resourceId },
      data: { template },
    });

    await generateData(resource.projectId, resourceId, count);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating template:", error);
    return Response.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}
