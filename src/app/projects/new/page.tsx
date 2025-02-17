'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/server/actions/projects';

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject({ name });
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Create New Project
        </h1>
        <p className="mt-2 text-gray-400">
          Create a new project to start building your mock APIs
        </p>
      </div>

      <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="My API Project"
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              Give your project a descriptive name
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 