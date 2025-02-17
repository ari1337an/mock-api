/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/server/actions/projects";
import { prisma } from "@/server/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { getErrorResponse } from "@/lib/utils";
import { processFakerTemplate } from "@/lib/faker";

// Define type for the data structure
type MockDataRecord = {
  id: string;
  [key: string]: unknown;
} & Prisma.JsonObject;

type RouteParams = {
  params: Promise<{
    projectId: string;
    version: string;
    resourceName: string;
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;

    // Get the resource definition
    const resource = await prisma.resource.findFirst({
      where: {
        projectId: resolvedParams.projectId,
        name: resolvedParams.resourceName,
      },
      select: {
        id: true,
        allowGetById: true,
      },
    });

    if (!resource) {
      return getErrorResponse(
        404,
        `Resource ${resolvedParams.resourceName} not found`
      );
    }

    // Check if GET by ID is allowed
    if (!resource.allowGetById) {
      return getErrorResponse(
        405,
        "GET by ID method not allowed for this resource"
      );
    }

    // Find the specific record
    const records = await prisma.mockData.findMany({
      where: {
        resourceId: resource.id,
      },
    });

    const record = records.find((item) => {
      const data = item.data as MockDataRecord;
      return data.id === resolvedParams.id;
    });

    if (!record) {
      return getErrorResponse(
        404,
        `Record with id ${resolvedParams.id} not found`
      );
    }

    return NextResponse.json(record.data);
  } catch (error) {
    console.error("API Error:", error);
    return getErrorResponse(500, "Internal server error");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams; // Extract id from params

    // Get the resource definition from the database
    const resource = await prisma.resource.findFirst({
      where: {
        projectId: resolvedParams.projectId,
        name: resolvedParams.resourceName,
      },
      select: {
        id: true,
        template: true,
        allowPut: true,
      },
    });

    if (!resource) {
      return getErrorResponse(
        404,
        `Resource ${resolvedParams.resourceName} not found`
      );
    }

    // Check if PUT is allowed
    if (!resource.allowPut) {
      return getErrorResponse(405, "PUT method not allowed for this resource");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return getErrorResponse(400, "Invalid JSON in request body");
    }

    // Process faker.js template values in the body
    const processedBody = processFakerTemplate(body);

    // Update the record
    const updatedRecord = await prisma.mockData.findFirst({
      where: {
        resourceId: resource.id,
        data: {
          equals: {
            id: id,
          },
        },
      },
    });

    if (!updatedRecord) {
      return getErrorResponse(404, `Record with id ${id} not found`);
    }

    const updated = await prisma.mockData.update({
      where: {
        id: updatedRecord.id,
      },
      data: {
        data: {
          ...processedBody,
          id: id,
        },
      },
    });

    return NextResponse.json(updated.data);
  } catch (error) {
    console.error("Error updating record:", error);
    return getErrorResponse(500, "Internal server error");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;

    const resource = await prisma.resource.findFirst({
      where: {
        projectId: resolvedParams.projectId,
        name: resolvedParams.resourceName,
      },
      select: {
        id: true,
        allowDelete: true,
      },
    });

    if (!resource) {
      return getErrorResponse(
        404,
        `Resource ${resolvedParams.resourceName} not found`
      );
    }

    // Check if DELETE is allowed
    if (!resource.allowDelete) {
      return getErrorResponse(
        405,
        "DELETE method not allowed for this resource"
      );
    }

    // Find the record to delete
    const records = await prisma.mockData.findMany({
      where: {
        resourceId: resource.id,
      },
    });

    const recordToDelete = records.find((item) => {
      const data = item.data as MockDataRecord;
      return data.id === resolvedParams.id;
    });

    if (!recordToDelete) {
      return getErrorResponse(
        404,
        `Record with id ${resolvedParams.id} not found`
      );
    }

    // Delete the record
    await prisma.mockData.delete({
      where: {
        id: recordToDelete.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API Error:", error);
    return getErrorResponse(500, "Internal server error");
  }
}
