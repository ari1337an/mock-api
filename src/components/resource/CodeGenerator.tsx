"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CodeGeneratorType } from '@/lib/generators';
import cn from 'clsx';
import { 
  generateFastAPIModels,
  generateFastAPIRouter,
  generateFastAPIGetAll,
  generateFastAPIGetOne,
  generateFastAPICreate,
  generateFastAPIUpdate,
  generateFastAPIDelete
} from '@/lib/generators/fastapi';
import {
  generateExpressTypes,
  generateExpressRouter,
  generateExpressGetAll,
  generateExpressGetOne,
  generateExpressCreate,
  generateExpressUpdate,
  generateExpressDelete
} from '@/lib/generators/express';
import { generateNextTypes, generateNextSetup, generateNextGetAll, generateNextGetById, generateNextCreate, generateNextUpdate, generateNextDelete } from '@/lib/generators/nextjs';
import type { GeneratorParams } from "@/lib/generators/index";
import { EndpointSchema, type EndpointState } from '@/lib/schemas/endpoints';
import { StepType } from '@/lib/types/steps';

interface CodeGeneratorProps {
  projectName: string;
  resourceName: string;
  version: string;
  template: Record<string, unknown>;
  initialEndpoints?: Partial<EndpointState>;
}

interface Step {
  id: string;
  title: string;
  description: string;
  generator: (params: GeneratorParams) => string;
  path: string;
  requires?: string[];
}

const FRAMEWORK_STEPS: Record<CodeGeneratorType, Step[]> = {
  [CodeGeneratorType.NEXTJS]: [
    {
      id: StepType.TYPES,
      title: 'Define Types',
      description: 'Set up TypeScript interfaces',
      generator: generateNextTypes,
      path: 'types/user.ts'
    },
    {
      id: StepType.SETUP,
      title: 'Initial Setup',
      description: 'Set up imports and configuration',
      generator: generateNextSetup,
      path: 'app/api/user/route.ts',
      requires: ['types']
    },
    {
      id: StepType.GET_ALL,
      title: 'GET All Endpoint',
      description: 'List all resources',
      generator: generateNextGetAll,
      path: 'app/api/user/route.ts',
      requires: ['setup']
    },
    {
      id: StepType.GET_ONE,
      title: 'GET By ID Endpoint',
      description: 'Add endpoint to fetch a single resource.',
      generator: generateNextGetById,
      path: 'user/[id]/route.ts',
      requires: ['setup']
    },
    {
      id: StepType.CREATE,
      title: 'POST Endpoint',
      description: 'Add endpoint to create a new resource.',
      generator: generateNextCreate,
      path: 'user/route.ts',
      requires: ['setup']
    },
    {
      id: StepType.UPDATE,
      title: 'PUT Endpoint',
      description: 'Add endpoint to update a resource.',
      generator: generateNextUpdate,
      path: 'user/[id]/route.ts',
      requires: ['setup']
    },
    {
      id: StepType.DELETE,
      title: 'DELETE Endpoint',
      description: 'Add endpoint to delete a resource.',
      generator: generateNextDelete,
      path: 'user/[id]/route.ts',
      requires: ['setup']
    }
  ],
  [CodeGeneratorType.FASTAPI]: [
    {
      id: StepType.TYPES,
      title: 'Define Models',
      description: 'Set up Pydantic models',
      generator: generateFastAPIModels,
      path: 'models.py'
    },
    {
      id: StepType.SETUP,
      title: 'Create Router',
      description: 'Initialize FastAPI router',
      generator: generateFastAPIRouter,
      path: 'routers/user.py',
      requires: ['types']
    },
    {
      id: StepType.GET_ALL,
      title: 'GET All Endpoint',
      description: 'List all resources',
      generator: generateFastAPIGetAll,
      path: 'routers/user.py',
      requires: ['setup']
    },
    {
      id: StepType.GET_ONE,
      title: 'GET By ID Endpoint',
      description: 'Get single resource',
      generator: generateFastAPIGetOne,
      path: 'routers/user.py',
      requires: ['setup']
    },
    {
      id: StepType.CREATE,
      title: 'POST Endpoint',
      description: 'Create new resource',
      generator: generateFastAPICreate,
      path: 'routers/user.py',
      requires: ['setup']
    },
    {
      id: StepType.UPDATE,
      title: 'PUT Endpoint',
      description: 'Update resource',
      generator: generateFastAPIUpdate,
      path: 'routers/user.py',
      requires: ['setup']
    },
    {
      id: StepType.DELETE,
      title: 'DELETE Endpoint',
      description: 'Delete resource',
      generator: generateFastAPIDelete,
      path: 'routers/user.py',
      requires: ['setup']
    }
  ],
  [CodeGeneratorType.EXPRESS]: [
    {
      id: StepType.TYPES,
      title: 'Define Types',
      description: 'Set up TypeScript interfaces',
      generator: generateExpressTypes,
      path: 'types/user.ts'
    },
    {
      id: StepType.SETUP,
      title: 'Create Router',
      description: 'Initialize Express router',
      generator: generateExpressRouter,
      path: 'routes/user.ts',
      requires: ['types']
    },
    {
      id: StepType.GET_ALL,
      title: 'GET All Endpoint',
      description: 'List all resources',
      generator: generateExpressGetAll,
      path: 'routes/user.ts',
      requires: ['setup']
    },
    {
      id: StepType.GET_ONE,
      title: 'GET By ID Endpoint',
      description: 'Get single resource',
      generator: generateExpressGetOne,
      path: 'routes/user.ts',
      requires: ['setup']
    },
    {
      id: StepType.CREATE,
      title: 'POST Endpoint',
      description: 'Create new resource',
      generator: generateExpressCreate,
      path: 'routes/user.ts',
      requires: ['setup']
    },
    {
      id: StepType.UPDATE,
      title: 'PUT Endpoint',
      description: 'Update resource',
      generator: generateExpressUpdate,
      path: 'routes/user.ts',
      requires: ['setup']
    },
    {
      id: StepType.DELETE,
      title: 'DELETE Endpoint',
      description: 'Delete resource',
      generator: generateExpressDelete,
      path: 'routes/user.ts',
      requires: ['setup']
    }
  ]
};

export function CodeGenerator({
  projectName,
  resourceName,
  version,
  template,
  initialEndpoints = {}
}: CodeGeneratorProps) {
  const [selectedFramework, setSelectedFramework] = useState<CodeGeneratorType>(CodeGeneratorType.NEXTJS);
  const [selectedStep, setSelectedStep] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Parse and validate endpoints with Zod
  const endpoints = EndpointSchema.parse(initialEndpoints);

  // Filter steps based on selected endpoints
  const availableSteps = useMemo(() => {
    return FRAMEWORK_STEPS[selectedFramework].filter(step => {
      // Always show types and setup if any endpoint is enabled
      if (step.id === StepType.TYPES || step.id === StepType.SETUP) {
        return Object.values(endpoints).some(Boolean);
      }
      
      // Show specific endpoints based on selection
      switch (step.id) {
        case StepType.GET_ALL: return endpoints.get;
        case StepType.GET_ONE: return endpoints.getById;
        case StepType.CREATE: return endpoints.post;
        case StepType.UPDATE: return endpoints.put;
        case StepType.DELETE: return endpoints.delete;
        default: return false;
      }
    });
  }, [selectedFramework, endpoints]);

  // Handle framework change and initial setup
  useEffect(() => {
    const initializeSteps = () => {
      if (availableSteps.length > 0) {
        const firstStep = availableSteps[0];
        const params: GeneratorParams = {
          projectName,
          resourceName,
          version,
          template,
          allowedEndpoints: endpoints
        };
        
        const generatedCode = firstStep.generator(params);
        
        // Batch state updates
        setSelectedStep(firstStep.id);
        setCode(generatedCode);
        setCompletedSteps(new Set([firstStep.id]));
      } else {
        // Batch state updates for no steps
        setSelectedStep('');
        setCode('// No endpoints selected');
        setCompletedSteps(new Set());
      }
    };

    initializeSteps();
  }, [selectedFramework]); // Only depend on framework changes

  const handleGenerate = useCallback((step: Step) => {
    const params: GeneratorParams = {
      projectName,
      resourceName,
      version,
      template,
      allowedEndpoints: endpoints
    };
    
    const generatedCode = step.generator(params);
    
    // Update completed steps
    const stepsToComplete = new Set<string>();
    for (const s of availableSteps) {
      stepsToComplete.add(s.id);
      if (s.id === step.id) break;
    }
    
    setCode(generatedCode);
    setCompletedSteps(stepsToComplete);
  }, [projectName, resourceName, version, template, endpoints, availableSteps]);

  const isStepDisabled = (step: Step) => {
    if (!step.requires?.length) return false;
    return step.requires.some(req => !completedSteps.has(req));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Framework Selector */}
      <div className="flex items-center gap-3">
        {Object.values(CodeGeneratorType).map((framework) => (
          <button
            key={framework}
            onClick={() => setSelectedFramework(framework)}
            className={cn(
              "px-6 py-3 rounded-lg transition-all duration-300 font-medium",
              selectedFramework === framework
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
            )}
          >
            {framework}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Steps Sidebar */}
        <div className="col-span-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Implementation Steps</h3>
          {availableSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setSelectedStep(step.id);
                handleGenerate(step);
              }}
              className={cn(
                "w-full text-left p-4 rounded-lg",
                selectedStep === step.id
                  ? "bg-blue-500/10 text-white"
                  : "bg-gray-800/50 text-gray-300",
                isStepDisabled(step) && "opacity-50 cursor-not-allowed"
              )}
              disabled={isStepDisabled(step)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0",
                  selectedStep === step.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-400"
                )}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium mb-1">{step.title}</div>
                  <div className="text-sm opacity-80">{step.description}</div>
                  <div className="text-xs mt-2 font-mono text-gray-500">{step.path}</div>
                  {step.requires?.length && (
                    <div className="text-xs mt-2 text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-500" />
                      Requires: {step.requires.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Code Display */}
        <div className="col-span-8">
          {code && (
            <div className="relative group">
              <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-3 rounded-t-lg border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <code className="text-sm text-gray-400 ml-3">
                    {availableSteps.find(s => s.id === selectedStep)?.path}
                  </code>
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-all duration-200",
                    "opacity-0 group-hover:opacity-100",
                    copied 
                      ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50"
                  )}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#1e1e1e] p-6 rounded-b-lg overflow-x-auto">
                <code className="text-gray-100 text-sm font-mono">{code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 