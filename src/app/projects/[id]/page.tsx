import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/server/actions/projects";
import { DeleteResourceButton } from "@/app/resources/DeleteResourceButton";
import { DeleteProjectButton } from "@/app/projects/DeleteProjectButton";

const ROOT_URL = process.env.ROOT_SITE;

interface Resource {
  id: string;
  name: string;
  endpoint: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  const apiBaseUrl = `${ROOT_URL}/${project.id}`;
  const getResourceEndpoint = (resource: Resource) => {
    const version = resource.endpoint.split("/")[1];
    return `api/${version}/${resource.name.toLowerCase()}`;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-gray-400">Base URL: {apiBaseUrl}</p>
          </div>
          <div className="flex items-center gap-4">
            <DeleteProjectButton id={project.id} />
            <Link
              href={`/projects/${project.id}/resources/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Create Resource
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 shadow-xl overflow-hidden sm:rounded-lg border border-gray-700">
          <ul className="divide-y divide-gray-700">
            {project.resources.map((resource) => (
              <li key={resource.id}>
                <div className="px-4 py-4 flex items-center justify-between sm:px-6 hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-100">
                      {resource.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Endpoint: {apiBaseUrl}/{getResourceEndpoint(resource)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/projects/${project.id}/resources/${resource.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <DeleteResourceButton resourceId={resource.id} />
                  </div>
                </div>
              </li>
            ))}

            {project.resources.length === 0 && (
              <li>
                <div className="px-4 py-8 text-center text-gray-500">
                  No resources yet. Create your first resource to get started.
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
