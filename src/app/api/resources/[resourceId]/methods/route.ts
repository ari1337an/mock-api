import { NextRequest } from "next/server";
import { prisma } from "@/server/infrastructure/prisma/client";
export async function PUT(request: NextRequest, { params }: { params: Promise<{ resourceId: string }> }) {
  try {
    const { resourceId } = await params;
    const updates = await request.json();

    // Validate that only allowed fields are being updated
    const allowedFields = ['allowGet', 'allowGetById', 'allowPost', 'allowPut', 'allowDelete'];
    const invalidFields = Object.keys(updates).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      return Response.json(
        { error: `Invalid fields: ${invalidFields.join(", ")}` },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: updates,
    });

    return Response.json(resource);
  } catch (error) {
    console.error("Error updating API methods:", error);
    return Response.json(
      { error: "Failed to update API methods" },
      { status: 500 }
    );
  }
} 