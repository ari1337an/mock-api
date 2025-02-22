"use client";

import { useState } from 'react';
import { generateFastAPICode } from '@/lib/generators/fastapi';
import type { TemplateField } from '@/types/template';

interface FastAPIGeneratorProps {
  projectName: string;
  resourceName: string;
  version: string;
  template: TemplateField[];
}

export function FastAPIGenerator({
  projectName,
  resourceName,
  version,
  template
}: FastAPIGeneratorProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const generatedCode = generateFastAPICode(
      projectName,
      resourceName,
      version,
      template
    );
    setCode(generatedCode);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Generate FastAPI Code
      </button>

      {code && (
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-sm rounded"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-gray-100">{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
} 