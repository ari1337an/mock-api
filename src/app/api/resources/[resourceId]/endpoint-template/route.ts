import { NextRequest } from "next/server";
import { prisma } from "@/server/infrastructure/prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const { resourceId } = await params;
    const { template } = await request.json();

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        endpointTemplate: template,
      },
    });

    return Response.json(resource);
  } catch (error) {
    console.error("Error updating endpoint template:", error);
    return Response.json(
      { error: "Failed to update endpoint template" },
      { status: 500 }
    );
  }
} 