"use server";

import Link from "next/link";
import { getProjects } from "@/server/actions/projects";

const ROOT_URL = process.env.ROOT_SITE;

export default async function Home() {
  const projects = (await getProjects()) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
            Create Your Mock API
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">
            Design, create and manage your mock APIs with ease. Generate realistic data for your frontend development.
          </p>
          <div className="mt-8">
            <Link
              href="/projects/new"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
            >
              Create New Project
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-200">
            <div className="text-blue-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Instant API Generation</h3>
            <p className="text-gray-400">Create RESTful APIs with mock data in seconds using our intuitive interface.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200">
            <div className="text-purple-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Realistic Data</h3>
            <p className="text-gray-400">Generate realistic mock data using our extensive library of data types.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all duration-200">
            <div className="text-green-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Code Generation</h3>
            <p className="text-gray-400">Get ready-to-use code for popular frameworks like Next.js, Express, and FastAPI.</p>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Your Projects</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {projects.map((project) => (
              <Link 
                key={project.id}
                href={`/projects/${project.id}`}
                className="block hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{project.name}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {project.resources.length} resources
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {ROOT_URL}/{project.id}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-400">
                No projects yet. Create your first project to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
