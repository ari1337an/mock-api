/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { InfoButton } from "./InfoButton";
import { useRouter } from "next/navigation";

interface ApiEndpointsSectionProps {
  resourceId: string;
  fullUrl: string;
  initialSettings: {
    allowGet: boolean;
    allowGetById: boolean;
    allowPost: boolean;
    allowPut: boolean;
    allowDelete: boolean;
  };
  template: Record<string, unknown>;
}

export function ApiEndpointsSection({
  resourceId,
  fullUrl,
  initialSettings,
  template,
}: ApiEndpointsSectionProps) {
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

  const getCurlCommand = (method: string, hasBody: boolean = false) => {
    let command = `curl -X ${method} '${fullUrl}${
      method !== "POST" ? "/:id" : ""
    }'`;

    if (hasBody) {
      command += ` \\\n  -H 'Content-Type: application/json' \\\n  -d '${JSON.stringify(
        template,
        null,
        2
      )}'`;
    }

    return command;
  };

  const ToggleSwitch = ({
    method,
    label,
  }: {
    method: keyof typeof settings;
    label: string;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={settings[method]}
      onClick={() => handleToggle(method)}
      className={`
        relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full 
        transition-colors duration-200 ease-in-out focus:outline-none ml-3
        ${settings[method] ? "bg-blue-600" : "bg-gray-700"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full 
          bg-white shadow transition duration-200 ease-in-out
          ${settings[method] ? "translate-x-5" : "translate-x-0.5"}
          mt-0.5 ml-0.5
        `}
      />
    </button>
  );

  return (
    <div className="bg-gray-800 shadow-xl sm:rounded-lg border border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-100">
          API Endpoints
        </h3>
        <div className="mt-5 border-t border-gray-700">
          <dl className="divide-y divide-gray-700">
            <div className="py-4">
              <div className="flex items-center mb-2">
                <dt className="text-sm font-medium text-gray-400">
                  GET - List all
                </dt>
                <ToggleSwitch method="allowGet" label="GET - List all" />
              </div>
              {settings.allowGet && (
                <dd className="mt-1 flex justify-between items-center">
                  <code className="text-sm text-gray-100 bg-gray-700 rounded px-2 py-1 overflow-x-auto whitespace-nowrap max-w-[calc(100%-3rem)]">
                    GET {fullUrl}
                  </code>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors ml-4 flex-shrink-0"
                  >
                    Open URL ↗
                  </a>
                </dd>
              )}
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <dt className="text-sm font-medium text-gray-400">
                  GET - Get one
                </dt>
                <ToggleSwitch method="allowGetById" label="GET - Get one" />
              </div>
              {settings.allowGetById && (
                <dd className="mt-1 flex justify-between items-center">
                  <code className="text-sm text-gray-100 bg-gray-700 rounded px-2 py-1 overflow-x-auto whitespace-nowrap max-w-[calc(100%-3rem)]">
                    GET {fullUrl}/:id
                  </code>
                  <InfoButton curlCommand={`curl -X GET '${fullUrl}/:id'`} />
                </dd>
              )}
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <dt className="text-sm font-medium text-gray-400">
                  POST - Create
                </dt>
                <ToggleSwitch method="allowPost" label="POST - Create" />
              </div>
              {settings.allowPost && (
                <dd className="mt-1 flex justify-between items-center">
                  <code className="text-sm text-gray-100 bg-gray-700 rounded px-2 py-1 overflow-x-auto whitespace-nowrap max-w-[calc(100%-3rem)]">
                    POST {fullUrl}
                  </code>
                  <InfoButton curlCommand={getCurlCommand("POST", true)} />
                </dd>
              )}
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <dt className="text-sm font-medium text-gray-400">
                  PUT - Update
                </dt>
                <ToggleSwitch method="allowPut" label="PUT - Update" />
              </div>
              {settings.allowPut && (
                <dd className="mt-1 flex justify-between items-center">
                  <code className="text-sm text-gray-100 bg-gray-700 rounded px-2 py-1 overflow-x-auto whitespace-nowrap max-w-[calc(100%-3rem)]">
                    PUT {fullUrl}/:id
                  </code>
                  <InfoButton curlCommand={getCurlCommand("PUT", true)} />
                </dd>
              )}
            </div>

            <div className="py-4">
              <div className="flex items-center mb-2">
                <dt className="text-sm font-medium text-gray-400">
                  DELETE - Remove
                </dt>
                <ToggleSwitch method="allowDelete" label="DELETE - Remove" />
              </div>
              {settings.allowDelete && (
                <dd className="mt-1 flex justify-between items-center">
                  <code className="text-sm text-gray-100 bg-gray-700 rounded px-2 py-1 overflow-x-auto whitespace-nowrap max-w-[calc(100%-3rem)]">
                    DELETE {fullUrl}/:id
                  </code>
                  <InfoButton curlCommand={getCurlCommand("DELETE")} />
                </dd>
              )}
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
