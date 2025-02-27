import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject } from "@/server/actions/projects";
import { getResource} from "@/server/actions/resources";
import { DeleteResourceButton } from "@/app/resources/DeleteResourceButton";
import { GenerateDataSection } from "./GenerateDataSection";
import { ApiEndpointsSection } from "@/app/components/ApiEndpointsSection";
import { CodeGenerator } from "@/components/resource/CodeGenerator";
import { ResourceTemplateWrapper } from "@/components/resource/ResourceTemplateWrapper";
import { CopyButton } from "@/components/common/CopyButton";

const ROOT_URL = process.env.ROOT_SITE;

interface PageProps {
  params: Promise<{
    id: string;
    resourceId: string;
  }>;
}

export default async function ResourcePage({ params }: PageProps) {
  const { id, resourceId } = await params;
  const project = await getProject(id);
  const resource = await getResource(resourceId);

  if (!project || !resource) {
    notFound();
  }

  const apiBaseUrl = `${ROOT_URL}/${project.id}`;
  const resourceEndpoint = `api/${resource.endpoint}`;
  const fullUrl = `${apiBaseUrl}/${resourceEndpoint}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Resource Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Projects
            </Link>
            <span>/</span>
            <Link 
              href={`/projects/${project.id}`}
              className="hover:text-gray-300 transition-colors"
            >
              {project.name}
            </Link>
            <span>/</span>
            <span className="text-gray-300">{resource.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {resource.name}
              </h1>
              <div className="flex items-center gap-4">
                <code className="px-2 py-1 bg-gray-800 rounded-md text-gray-300 font-mono">
                  {fullUrl}
                </code>
                <CopyButton text={fullUrl} />
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {resource._count?.data || 0} records
                </div>
              </div>
            </div>
            <DeleteResourceButton resourceId={resource.id} />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6">
          {/* Data Generation Section */}
          <div className="p-6 rounded-xl border border-gray-700/50 bg-gray-800/30">
            <GenerateDataSection
              projectId={project.id}
              resourceId={resource.id}
              initialCount={resource._count?.data ?? 0}
            />
          </div>

          {/* API Endpoints Section */}
          <div className="p-6 rounded-xl border border-gray-700/50 bg-gray-800/30">
            <ApiEndpointsSection
              resourceId={resource.id}
              fullUrl={fullUrl}
              initialSettings={{
                allowGet: resource.allowGet,
                allowGetById: resource.allowGetById,
                allowPost: resource.allowPost,
                allowPut: resource.allowPut,
                allowDelete: resource.allowDelete,
              }}
              template={resource.template as Record<string, unknown>}
            />
          </div>

          {/* Template Editor */}
          <div className="p-6 rounded-xl border border-gray-700/50 bg-gray-800/30">
            <ResourceTemplateWrapper
              resourceId={resource.id}
              template={resource.template as Record<string, unknown>}
            />
          </div>

          {/* Code Generator */}
          <div className="p-6 rounded-xl border border-gray-700/50 bg-gray-800/30">
            <h2 className="text-xl font-semibold mb-6 text-white">
              API Code Generator
            </h2>
            <CodeGenerator
              projectName={project.name}
              resourceName={resource.name}
              version={resource.endpoint.split('/')[0]}
              template={resource.template as Record<string, unknown>}
              initialEndpoints={{
                get: resource.allowGet,
                getById: resource.allowGetById,
                post: resource.allowPost,
                put: resource.allowPut,
                delete: resource.allowDelete
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
