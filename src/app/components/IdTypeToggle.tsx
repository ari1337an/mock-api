"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface IdTypeToggleProps {
  resourceId: string;
  initialIsIncremental: boolean;
  currentCount: number;
}

export function IdTypeToggle({
  resourceId,
  initialIsIncremental,
  currentCount,
}: IdTypeToggleProps) {
  const [isIncremental, setIsIncremental] = useState(initialIsIncremental);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}/id-type`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          useIncrementalIds: !isIncremental,
          count: currentCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ID type");
      }

      setIsIncremental(!isIncremental);
      router.refresh();
    } catch (error) {
      console.error("Error updating ID type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 whitespace-nowrap">Use Incremental IDs</span>
      <button
        type="button"
        role="switch"
        aria-checked={isIncremental}
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full 
          transition-colors duration-200 ease-in-out focus:outline-none
          ${isIncremental ? 'bg-blue-600' : 'bg-gray-700'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow
            transition duration-200 ease-in-out
            ${isIncremental ? 'translate-x-5' : 'translate-x-0.5'}
            mt-0.5 ml-0.5
          `}
        />
      </button>
    </div>
  );
} 