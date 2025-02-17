"use client";

import { useState, useEffect } from "react";
import { generateData } from "@/server/actions/resources";

export function GenerateDataSection({
  projectId,
  resourceId,
  initialCount = 0,
}: {
  projectId: string;
  resourceId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleGenerate = async (newCount: number) => {
    try {
      setIsGenerating(true);
      await generateData(projectId, resourceId, newCount);
    } catch (error) {
      console.error("Failed to generate data:", error);
      alert("Failed to generate data");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800 shadow-xl sm:rounded-lg border border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-100">
            Mock Data Generator
          </h3>
          {isGenerating && (
            <span className="text-sm text-blue-400 animate-pulse">
              Generating...
            </span>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-300">
              Number of Records: {count}
            </label>
            <span className="text-sm text-gray-400">(0-50)</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            onMouseUp={() => handleGenerate(count)}
            onTouchEnd={() => handleGenerate(count)}
            className="mt-2 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
