"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ApiMethodTogglesProps {
  resourceId: string;
  initialSettings: {
    allowGet: boolean;
    allowGetById: boolean;
    allowPost: boolean;
    allowPut: boolean;
    allowDelete: boolean;
  };
}

export function ApiMethodToggles({
  resourceId,
  initialSettings,
}: ApiMethodTogglesProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleToggle = async (method: keyof typeof settings) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}/methods`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [method]: !settings[method],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update API method settings");
      }

      setSettings((prev) => ({
        ...prev,
        [method]: !prev[method],
      }));
      
      router.refresh();
    } catch (error) {
      console.error("Error updating API method settings:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const methods = [
    { key: "allowGet" as const, label: "GET /", description: "List all records" },
    { key: "allowGetById" as const, label: "GET /:id", description: "Get single record" },
    { key: "allowPost" as const, label: "POST /", description: "Create new record" },
    { key: "allowPut" as const, label: "PUT /:id", description: "Update record" },
    { key: "allowDelete" as const, label: "DELETE /:id", description: "Delete record" },
  ];

  return (
    <div className="bg-gray-800 shadow-xl sm:rounded-lg border border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-100 mb-4">
          API Methods
        </h3>
        <div className="space-y-4">
          {methods.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <span className="text-xs text-gray-500">{description}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings[key]}
                disabled={isUpdating}
                onClick={() => handleToggle(key)}
                className={`
                  relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full 
                  transition-colors duration-200 ease-in-out focus:outline-none
                  ${settings[key] ? "bg-blue-600" : "bg-gray-700"}
                  ${isUpdating ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-4 w-4 transform rounded-full 
                    bg-white shadow transition duration-200 ease-in-out
                    ${settings[key] ? "translate-x-5" : "translate-x-0.5"}
                    mt-0.5 ml-0.5
                  `}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 