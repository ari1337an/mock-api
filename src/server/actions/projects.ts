"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../infrastructure/prisma/client";

export async function createProject(data: { name: string }) {
  const project = await prisma.project.create({
    data: {
      name: data.name,
    },
  });

  revalidatePath("/projects");
  return project;
}

export async function getProjects() {
  try {
    return prisma.project.findMany({
      include: {
        resources: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getProjectsWithoutResources() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      resources: true,
    },
  });
}

export async function deleteProject(id: string) {
  // Delete all resources first (Prisma will handle this automatically with cascading deletes)
  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/projects");
  revalidatePath("/");
}
