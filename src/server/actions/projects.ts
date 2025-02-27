"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../infrastructure/prisma/client";
import type { Project, Resource } from "@prisma/client";

interface ProjectWithResources extends Project {
  resources: (Resource & {
    _count?: {
      data: number;
    };
  })[];
}

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
    const projects = await prisma.project.findMany({
      include: {
        resources: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return projects;
  } catch (error) {
    console.error("Database connection error:", error);
    return []; // Return empty array as fallback
  }
}

export async function getProjectsWithoutResources() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(id: string): Promise<ProjectWithResources | null> {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      resources: {
        include: {
          _count: {
            select: { data: true }
          }
        }
      }
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
