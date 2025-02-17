import { getResources } from "@/server/actions/resources";
import Link from "next/link";
import { DeleteResourceButton } from "./DeleteResourceButton";

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your API Resources
          </h1>
          <Link
            href="/resources/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create New
          </Link>
        </div>

        <div className="bg-gray-800 shadow-xl overflow-hidden sm:rounded-lg border border-gray-700">
          <ul className="divide-y divide-gray-700">
            {resources.map((resource) => (
              <li key={resource.id}>
                <div className="px-4 py-4 flex items-center justify-between sm:px-6 hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-100">
                      {resource.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {resource.endpoint}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/resources/${resource.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <DeleteResourceButton resourceId={resource.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
