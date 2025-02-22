"use client";

import { useState } from 'react';
import { generateFastAPICode } from '@/lib/generators/fastapi';
import { generateExpressCode } from '@/lib/generators/express';
import { generateReactCode } from '@/lib/generators/react';
import { CodeGeneratorType } from '@/lib/generators';
interface CodeGeneratorProps {
  projectName: string;
  resourceName: string;
  version: string;
  template: Record<string, unknown>;
}

export function CodeGenerator({
  projectName,
  resourceName,
  version,
  template
}: CodeGeneratorProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedGenerator, setSelectedGenerator] = useState<CodeGeneratorType>(CodeGeneratorType.FASTAPI);

  const handleGenerate = () => {
    let generatedCode = '';
    switch (selectedGenerator) {
      case CodeGeneratorType.FASTAPI:
        generatedCode = generateFastAPICode(projectName, resourceName, version, template);
        break;
      case CodeGeneratorType.EXPRESS:
        generatedCode = generateExpressCode(projectName, resourceName, version, template);
        break;
      case CodeGeneratorType.REACT:
        generatedCode = generateReactCode(projectName, resourceName, version, template);
        break;
    }
    setCode(generatedCode);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select
          value={selectedGenerator}
          onChange={(e) => setSelectedGenerator(e.target.value as CodeGeneratorType)}
          className="bg-gray-700 text-gray-100 rounded px-3 py-2"
        >
          <option value={CodeGeneratorType.FASTAPI}>FastAPI</option>
          <option value={CodeGeneratorType.EXPRESS}>Express.js</option>
          <option value={CodeGeneratorType.REACT}>React Client</option>
        </select>
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Code
        </button>
      </div>

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