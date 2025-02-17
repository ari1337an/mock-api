"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteResource } from "@/server/actions/resources";

export function DeleteResourceButton({ resourceId }: { resourceId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const resource = await deleteResource(resourceId);
      router.push(`/projects/${resource.projectId}`);
    } catch (error) {
      console.error("Error deleting resource:", error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
} 