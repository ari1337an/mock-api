/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditableTemplateProps {
  template: Record<string, unknown>;
  resourceId: string;
  _projectId: string;
  currentCount: number;
}

function formatTemplateWithLinks(template: Record<string, unknown>): string {
  const formattedJson = JSON.stringify(template, null, 2);

  const lines = formattedJson.split("\n");

  return lines
    .map((line) => {
      return line.replace(
        /("?)(\$[a-z]+\.[a-z]+)("?)/gi,
        (match, prefix, fakerPath, suffix) => {
          const [module, method] = fakerPath.substring(1).split(".");
          const url = `https://fakerjs.dev/api/${module}.html#${method.toLowerCase()}`;
          return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${fakerPath}</a>${suffix}`;
        }
      );
    })
    .join("\n");
}

function createMarkup(content: string) {
  return { __html: content };
}

export function EditableTemplate({
  template,
  resourceId,
  currentCount,
  _projectId,
}: EditableTemplateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Format and set initial template
  useEffect(() => {
    const rawValue = JSON.stringify(template, null, 2);
    setValue(rawValue);
    setFormattedValue(formatTemplateWithLinks(template));
  }, [template]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Validate and format JSON
      const parsedTemplate = JSON.parse(value);
      const rawValue = JSON.stringify(parsedTemplate, null, 2);
      setValue(rawValue);
      setFormattedValue(formatTemplateWithLinks(parsedTemplate));

      // Update template and regenerate data
      const response = await fetch(`/api/resources/${resourceId}/template`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: parsedTemplate,
          count: currentCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update template");
      }

      setIsEditing(false);
      setError(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON format");
    }
  };

  const handleCancel = () => {
    setValue(JSON.stringify(template, null, 2));
    setFormattedValue(formatTemplateWithLinks(template));
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-100">Data Template</h3>
          <p className="text-sm text-gray-400 mt-1">
            Use <code className="text-blue-400">$module.method</code> syntax for
            Faker.js values. Click on them to view documentation.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      {isEditing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full h-64 bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          spellCheck={false}
        />
      ) : (
        <div
          className="bg-gray-700 p-4 rounded-lg overflow-auto text-sm text-gray-100 font-mono whitespace-pre leading-relaxed"
          dangerouslySetInnerHTML={createMarkup(formattedValue)}
        />
      )}
    </div>
  );
}
