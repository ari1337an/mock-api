"use client";

import { useRouter } from "next/navigation";
import { deleteProject } from "@/server/actions/projects";

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project? This will delete all resources associated with it.")) {
      try {
        await deleteProject(id);
        router.push("/");
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center px-3 py-2 border border-red-600 shadow-sm text-sm font-medium rounded-md text-red-600 bg-transparent hover:bg-red-600 hover:text-white transition-colors duration-200"
    >
      Delete Project
    </button>
  );
} 