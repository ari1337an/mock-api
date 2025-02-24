import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject } from "@/server/actions/projects";
import { getResource} from "@/server/actions/resources";
import { DeleteResourceButton } from "@/app/resources/DeleteResourceButton";
import { GenerateDataSection } from "./GenerateDataSection";
import { IdTypeToggle } from "@/app/components/IdTypeToggle";
import { ApiEndpointsSection } from "@/app/components/ApiEndpointsSection";
import { EndpointTemplateEditor } from "@/app/components/EndpointTemplateEditor";
import { CodeGenerator } from "@/components/resource/CodeGenerator";
import { ResourceTemplateWrapper } from "@/components/resource/ResourceTemplateWrapper";

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
  const currentCount = resource._count?.data ?? 0;

  const fullUrl = `${apiBaseUrl}/${resourceEndpoint}`;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Link
                href={`/projects/${project.id}`}
                className="hover:text-gray-300 transition-colors duration-200"
              >
                {project.name}
              </Link>
              <span>/</span>
              <span>{resource.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-100">
                {resource.name}
              </h1>
              <IdTypeToggle
                resourceId={resource.id}
                initialIsIncremental={resource.useIncrementalIds}
                currentCount={currentCount}
              />
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Base URL: {apiBaseUrl}/{resourceEndpoint}
            </p>
          </div>
          <DeleteResourceButton resourceId={resource.id} />
        </div>

        <GenerateDataSection
          projectId={project.id}
          resourceId={resource.id}
          initialCount={currentCount}
        />

        <div className="grid grid-cols-1 gap-6 mt-6">
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
          <div className="mt-6 bg-gray-800 shadow-xl sm:rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <ResourceTemplateWrapper
                resourceId={resource.id}
                template={resource.template as Record<string, unknown>}
              />
            </div>
          </div>
          <EndpointTemplateEditor
            resourceId={resource.id}
            initialTemplate={
              resource.endpointTemplate as Record<string, unknown>
            }
          />
        </div>

        {/* API Code Generator */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">
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
  );
}
