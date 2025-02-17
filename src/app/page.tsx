import Link from "next/link";
import { getProjects } from "@/server/actions/projects";

const ROOT_URL = process.env.ROOT_SITE;

export default async function Home() {
  const projects = await getProjects();
  const baseUrl = ROOT_URL;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 sm:text-5xl md:text-6xl">
            Create Your Mock API
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Design, create and manage your mock APIs with ease. Generate
            realistic data for your frontend development.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/projects/new"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 md:py-4 md:text-lg md:px-10"
              >
                Create New Project
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 shadow-xl overflow-hidden sm:rounded-lg mt-8 border border-gray-700">
          <ul className="divide-y divide-gray-700">
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`}>
                  <div className="px-4 py-4 flex items-center hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-100">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {project.resources.length} resources
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Base URL: {baseUrl}/{project.id}
                      </p>
                    </div>
                    <div>
                      <svg
                        className="h-5 w-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
