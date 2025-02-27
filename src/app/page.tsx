"use server";

import Link from "next/link";
import { getProjects } from "@/server/actions/projects";

const ROOT_URL = process.env.ROOT_SITE;

export default async function Home() {
  const projects = (await getProjects()) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section with Nextra-style */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold tracking-tight text-white mb-4">
            Mock<span className="text-blue-500">API</span>
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
            Build and test your frontend with realistic mock APIs. Generate code for Next.js, Express, and FastAPI.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/projects/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
            >
              Create New Project
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center px-6 py-3 border border-gray-700 text-base font-medium rounded-lg text-gray-300 hover:bg-gray-800 transition-all duration-200"
            >
              Documentation
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Features Grid with Nextra-style cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:border-blue-500/30 hover:bg-gray-800/50 transition-all duration-200">
            <div className="text-blue-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant API Generation</h3>
            <p className="text-gray-400">Generate RESTful APIs with realistic mock data in seconds.</p>
          </div>

          <div className="p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:border-purple-500/30 hover:bg-gray-800/50 transition-all duration-200">
            <div className="text-purple-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Realistic Data</h3>
            <p className="text-gray-400">Powered by Faker.js for realistic and customizable mock data.</p>
          </div>

          <div className="p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:border-green-500/30 hover:bg-gray-800/50 transition-all duration-200">
            <div className="text-green-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Code Generation</h3>
            <p className="text-gray-400">Get ready-to-use code for your favorite frameworks.</p>
          </div>
        </div>

        {/* Projects List with Nextra-style */}
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700/50">
            <h2 className="text-xl font-semibold text-white">Your Projects</h2>
          </div>
          <div className="divide-y divide-gray-700/50">
            {projects.map((project) => (
              <Link 
                key={project.id}
                href={`/projects/${project.id}`}
                className="block hover:bg-gray-700/30 transition-colors duration-200"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{project.name}</h3>
                      <div className="mt-1 flex items-center gap-4">
                        <p className="text-sm text-gray-400">
                          {project.resources.length} resources
                        </p>
                        <code className="text-xs px-2 py-1 rounded-md bg-gray-700/50 text-gray-300">
                          {ROOT_URL}/{project.id}
                        </code>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-400">No projects yet. Create your first project to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
