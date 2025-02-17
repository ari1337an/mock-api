import { NextRequest } from "next/server";
import { prisma } from "@/server/infrastructure/prisma/client";

type RouteParams = {
  params: Promise<{
    resourceId: string;
  }>;
};

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { resourceId } = await params;

    const resource = await prisma.resource.delete({
      where: { id: resourceId },
      include: {
        project: true,
      },
    });

    return Response.json(resource);
  } catch (error) {
    console.error("Error deleting resource:", error);
    return Response.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { resourceId } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        projectId: true,
      },
    });

    if (!resource) {
      return Response.json({ error: "Resource not found" }, { status: 404 });
    }

    return Response.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
