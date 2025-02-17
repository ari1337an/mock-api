"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EndpointTemplateEditorProps {
  resourceId: string;
  initialTemplate: Record<string, unknown>;
}

export function EndpointTemplateEditor({
  resourceId,
  initialTemplate,
}: EndpointTemplateEditorProps) {
  const [template, setTemplate] =
    useState<Record<string, unknown>>(initialTemplate);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    JSON.stringify(initialTemplate, null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleTemplateChange = async (newTemplate: Record<string, unknown>) => {
    try {
      const response = await fetch(
        `/api/resources/${resourceId}/endpoint-template`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ template: newTemplate }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update endpoint template");
      }

      setTemplate(newTemplate);
      setIsEditing(false);
      setError(null);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update template"
      );
    }
  };

  const handleSaveEdit = () => {
    try {
      const parsed = JSON.parse(editValue);
      handleTemplateChange(parsed);
    } catch (e) {
      console.error(e);
      setError("Invalid JSON format");
    }
  };

  return (
    <div className="bg-gray-800 shadow-xl sm:rounded-lg border border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-100">
            Endpoint Template
          </h3>
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveEdit();
              } else {
                setIsEditing(true);
                setEditValue(JSON.stringify(template, null, 2));
              }
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900/50 rounded-md p-4 text-sm text-gray-400 space-y-3">
            <p>
              <span className="font-medium text-gray-300">
                Available Variables:
              </span>
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <code className="text-xs bg-gray-700 px-1 py-0.5 rounded">
                  $mockData
                </code>
                <span className="ml-2">
                  Returns the array of generated data
                </span>
              </li>
              <li>
                <code className="text-xs bg-gray-700 px-1 py-0.5 rounded">
                  $count
                </code>
                <span className="ml-2">Returns the total number of items</span>
              </li>
              <li>
                <code className="text-xs bg-gray-700 px-1 py-0.5 rounded">
                  $method.function
                </code>
                <span className="ml-2">
                  Generates dynamic data using FakerJS
                </span>
              </li>
            </ul>
          </div>

          {!isEditing ? (
            <div className="mt-4">
              <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto">
                <code className="text-sm text-gray-300">
                  {JSON.stringify(template, null, 2)}
                </code>
              </pre>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-48 bg-gray-900 text-gray-300 p-4 rounded-md font-mono text-sm"
                placeholder="Enter your template JSON..."
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
