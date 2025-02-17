"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../infrastructure/prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { processFakerTemplate } from "@/lib/faker";
import { Prisma } from "@prisma/client";

// Export the types
export type TemplateValue =
  | string
  | number
  | boolean
  | null
  | TemplateObject
  | TemplateValue[];

export interface TemplateObject {
  [key: string]: TemplateValue;
}

export type EndpointTemplate = Prisma.JsonValue;

export async function createResource(
  projectId: string,
  data: {
    name: string;
    endpoint: string;
    template: TemplateObject;
    allowGet?: boolean;
    allowGetById?: boolean;
    allowPost?: boolean;
    allowPut?: boolean;
    allowDelete?: boolean;
    endpointTemplate?: EndpointTemplate | null;
  }
) {
  const resource = await prisma.resource.create({
    data: {
      ...data,
      projectId,
      allowGet: data.allowGet ?? true,
      allowGetById: data.allowGetById ?? true,
      allowPost: data.allowPost ?? true,
      allowPut: data.allowPut ?? true,
      allowDelete: data.allowDelete ?? true,
      endpointTemplate: "$mockData",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return resource;
}

export async function getProjectResources(projectId: string) {
  return prisma.resource.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getResource(id: string) {
  return prisma.resource.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      endpoint: true,
      template: true,
      useIncrementalIds: true,
      allowGet: true,
      allowGetById: true,
      allowPost: true,
      allowPut: true,
      allowDelete: true,
      projectId: true,
      createdAt: true,
      updatedAt: true,
      endpointTemplate: true,
      _count: {
        select: {
          data: true,
        },
      },
    },
  });
}

export async function deleteResource(id: string) {
  const resource = await prisma.resource.delete({
    where: { id },
    select: {
      id: true,
      projectId: true,
    },
  });

  revalidatePath(`/projects/${resource.projectId}`);
  return resource;
}

export async function generateData(
  projectId: string,
  resourceId: string,
  count: number
) {
  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      projectId,
    },
  });

  if (!resource) {
    throw new Error("Resource not found");
  }

  // Delete existing data
  await prisma.mockData.deleteMany({
    where: {
      resourceId,
    },
  });

  // Generate new data with all template fields
  const template = resource.template as TemplateObject;
  const mockData = Array.from({ length: count }, (_, index) => ({
    data: {
      id: resource.useIncrementalIds ? String(index + 1) : createId(),
      ...processFakerTemplate(template),
    },
    resourceId,
  }));

  // Insert in batches of 100
  for (let i = 0; i < mockData.length; i += 100) {
    const batch = mockData.slice(i, i + 100);
    await prisma.mockData.createMany({
      data: batch,
    });
  }

  revalidatePath(`/projects/${projectId}/resources/${resourceId}`);
}

export async function updateResourceTemplate(
  resourceId: string,
  template: TemplateObject,
  count: number
) {
  try {
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: { template },
    });

    // Regenerate data with new template
    await generateData(updatedResource.projectId, resourceId, count);

    return { success: true, resource: updatedResource };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update template"
    );
  }
}

export async function getResources() {
  return prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: {
          name: true,
        },
      },
    },
  });
}
