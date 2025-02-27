import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/server/actions/projects";
import { DeleteResourceButton } from "@/app/resources/DeleteResourceButton";
import { DeleteProjectButton } from "@/app/projects/DeleteProjectButton";
import { CopyButton } from "@/components/common/CopyButton";
import type { Resource as PrismaResource } from "@prisma/client";

const ROOT_URL = process.env.ROOT_SITE;

interface Resource extends PrismaResource {
  _count?: {
    data: number;
  };
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-gray-300">{project.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
              <div className="flex items-center gap-2 text-sm">
                <code className="px-2 py-1 bg-gray-800 rounded-md text-gray-300 font-mono">
                  {apiBaseUrl}
                </code>
                <CopyButton text={apiBaseUrl} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DeleteProjectButton id={project.id} />
              <Link
                href={`/projects/${project.id}/resources/new`}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Resource
              </Link>
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {project.resources.map((resource) => (
            <div 
              key={resource.id}
              className="p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:border-blue-500/30 hover:bg-gray-800/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {resource.name}
                  </h3>
                  <div className="flex items-center gap-4">
                    <code className="text-sm px-2 py-1 bg-gray-800 rounded-md text-gray-300 font-mono">
                      {apiBaseUrl}/{getResourceEndpoint(resource)}
                    </code>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {resource._count?.data || 0} records
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/projects/${project.id}/resources/${resource.id}`}
                    className="px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <span className="sr-only">View Resource</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <DeleteResourceButton resourceId={resource.id} />
                </div>
              </div>
            </div>
          ))}

          {project.resources.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-400 mb-4">No resources yet</p>
              <Link
                href={`/projects/${project.id}/resources/new`}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
              >
                Create your first resource
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
