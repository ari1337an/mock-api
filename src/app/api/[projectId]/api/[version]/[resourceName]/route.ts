/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/server/actions/projects";
import { prisma } from "@/server/infrastructure/prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { getErrorResponse } from "@/lib/utils";
import { processFakerTemplate } from "@/lib/faker";

type RouteParams = {
  params: Promise<{
    projectId: string;
    version: string;
    resourceName: string;
  }>;
};

// ... rest of the generateMockData function ...

export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const params = await props.params;

    // Validate params
    if (!params.projectId || !params.version || !params.resourceName) {
      return getErrorResponse(400, "Missing required parameters");
    }

    // Get the resource definition from the database
    const resource = await prisma.resource.findFirst({
      where: {
        projectId: params.projectId,
        name: params.resourceName,
      },
      select: {
        id: true,
        template: true,
        allowGet: true,
        endpointTemplate: true,
      },
    });

    if (!resource) {
      return getErrorResponse(404, `Resource ${params.resourceName} not found`);
    }

    // Check if GET is allowed
    if (!resource.allowGet) {
      return getErrorResponse(405, "GET method not allowed for this resource");
    }

    // Get the records for this resource
    const records = await prisma.mockData.findMany({
      where: {
        resourceId: resource.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get template keys to maintain field order
    const templateKeys = Object.keys(
      resource.template as Record<string, unknown>
    );

    // Map the records while preserving field order from template
    const responseData = records.map((record) => {
      const data = record.data as Record<string, unknown>;
      const orderedData: Record<string, unknown> = {};

      // First add id
      orderedData.id = data.id;

      // Then add other fields in template order
      templateKeys.forEach((key) => {
        if (key !== "id" && key in data) {
          orderedData[key] = data[key];
        }
      });

      return orderedData;
    });

    // Process the endpoint template
    let response: any = resource.endpointTemplate;
    if (typeof response === "string" && response === "$mockData") {
      response = responseData;
    } else if (typeof response === "object" && response !== null) {
      response = Object.entries(response as Record<string, unknown>).reduce((acc, [key, value]) => {
        if (value === "$mockData") {
          acc[key] = responseData;
        } else if (value === "$count") {
          acc[key] = responseData.length;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return getErrorResponse(500, "Internal server error");
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;

    // Get the resource definition from the database
    const resource = await prisma.resource.findFirst({
      where: {
        projectId: resolvedParams.projectId,
        name: resolvedParams.resourceName,
      },
      select: {
        id: true,
        template: true,
        useIncrementalIds: true,
        allowPost: true,
        _count: {
          select: {
            data: true,
          },
        },
      },
    });

    if (!resource) {
      return getErrorResponse(
        404,
        `Resource ${resolvedParams.resourceName} not found`
      );
    }

    // Check if POST is allowed
    if (!resource.allowPost) {
      return getErrorResponse(405, "POST method not allowed for this resource");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return getErrorResponse(400, "Invalid JSON in request body");
    }

    // Validate body against template
    const template = resource.template as Record<string, unknown>;
    const invalidFields = Object.keys(body).filter((key) => !(key in template));

    if (invalidFields.length > 0) {
      return getErrorResponse(
        400,
        `Invalid fields: ${invalidFields.join(
          ", "
        )}. Allowed fields: ${Object.keys(template).join(", ")}`
      );
    }

    // Process faker.js template values in the body
    const processedBody = processFakerTemplate(body);

    // Generate ID based on resource settings
    const newId = resource.useIncrementalIds
      ? String((resource._count?.data ?? 0) + 1)
      : createId();

    // Create new record with the provided data and the appropriate ID
    const newRecord = await prisma.mockData.create({
      data: {
        resourceId: resource.id,
        data: {
          id: newId,
          ...processedBody,
        },
      },
    });

    return NextResponse.json(newRecord.data, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating record:", error.message);
    }
    return getErrorResponse(500, "Internal server error");
  }
}

export async function PUT(request: NextRequest, props: RouteParams) {
  try {
    const params = await props.params;
    const project = await getProject(params.projectId);

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const resource = project.resources.find(
      (r) => r.endpoint === `api/${params.version}/${params.resourceName}`
    );
    if (!resource) {
      return Response.json({ error: "Resource not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    });

    if (!body?.id) {
      return Response.json(
        { error: "Missing id in request body" },
        { status: 400 }
      );
    }

    // Find the record to update
    const records = await prisma.mockData.findMany({
      where: {
        resourceId: resource.id,
      },
    });

    const existingRecord = records.find((record) => {
      const data = record.data as { id: string };
      return data.id === body.id;
    });

    if (!existingRecord) {
      return Response.json(
        { error: `Record with id ${body.id} not found` },
        { status: 404 }
      );
    }

    // Update while preserving the ID
    const updated = await prisma.mockData.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        data: {
          ...body,
          id: body.id, // Ensure ID remains unchanged
        },
      },
    });

    return Response.json(updated.data);
  } catch (error) {
    console.error("Error updating record:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Similarly update the other handlers (POST, PUT, DELETE)
