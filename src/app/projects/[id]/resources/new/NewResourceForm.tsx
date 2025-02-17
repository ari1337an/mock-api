"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createResource } from "@/server/actions/resources";

interface NewResourceFormProps {
  projectId: string;
}

export default function NewResourceForm({ projectId }: NewResourceFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [version, setVersion] = useState("v1");
  const [templateText, setTemplateText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Function to convert string to slug
  const toSlug = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove non-word chars
      .replace(/[\s_-]+/g, "-") // Replace spaces and _ with -
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing -
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sluggedName = toSlug(e.target.value);
    setName(sluggedName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const template = JSON.parse(templateText);
      const endpoint = `${version}/${name}`;
      await createResource(projectId, {
        name,
        endpoint,
        template,
      });
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error(error);
      setError("Invalid JSON format. Please check your template.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">
        Create New Resource
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Resource Name
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            placeholder="users-posts"
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            title="Lowercase letters, numbers, and hyphens only. Must start and end with a letter or number."
          />
          <p className="mt-1 text-sm text-gray-400">
            Use lowercase letters, numbers, and hyphens only (e.g.,
            &quot;blog-posts&quot;, &quot;users&quot;, &quot;api-keys&quot;)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            API Version
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-800 text-gray-400 sm:text-sm">
              api/
            </span>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="flex-1 block w-full rounded-none rounded-r-md border border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="v1"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Example: v1, v2, beta, etc.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Data Template
          </label>
          <textarea
            rows={10}
            value={templateText}
            onChange={(e) => {
              setTemplateText(e.target.value);
              setError(null);
            }}
            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm p-2"
            placeholder={`{
  "username": "$internet.userName",
  "email": "$internet.email",
  "status": "$helpers.arrayElement([\"active\", \"inactive\", \"pending\"])",
  "profile": {
    "firstName": "$name.firstName",
    "lastName": "$name.lastName",
    "age": "$number.int(18, 80)"
  }
}`}
            required
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <p className="mt-2 text-sm text-gray-400">
            Use $faker.method for dynamic values
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Create Resource
          </button>
        </div>
      </form>
    </div>
  );
}
