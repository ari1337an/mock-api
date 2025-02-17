import { NextRequest } from "next/server";
import { prisma } from "@/server/infrastructure/prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { MockData } from "@prisma/client";

type RouteParams = {
  params: Promise<{
    resourceId: string;
  }>;
};

interface MockDataRecord {
  id: string;
  [key: string]: unknown;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { resourceId } = await params;
    const { useIncrementalIds } = await request.json();

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        data: true, // Include existing data records
      },
    });

    if (!resource) {
      return Response.json({ error: "Resource not found" }, { status: 404 });
    }

    // First update the resource setting
    await prisma.resource.update({
      where: { id: resourceId },
      data: { useIncrementalIds },
    });

    // Then update all existing records with new IDs
    const updatePromises = resource.data.map(
      async (record: MockData, index) => {
        const oldData = record.data as MockDataRecord;
        const newId = useIncrementalIds
          ? String(index + 1) // Incremental ID
          : createId(); // CUID

        return prisma.mockData.update({
          where: { id: record.id },
          data: {
            data: {
              ...oldData,
              id: newId, // Only update the ID
            },
          },
        });
      }
    );

    await Promise.all(updatePromises);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating ID type:", error);
    return Response.json(
      { error: "Failed to update ID type" },
      { status: 500 }
    );
  }
}
