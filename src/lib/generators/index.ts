export enum CodeGeneratorType {
  NEXTJS = 'Next.js',
  EXPRESS = 'Express.js',
  FASTAPI = 'FastAPI'
}

export interface CodeGenerator {
  type: CodeGeneratorType;
  label: string;
  generate: (params: GeneratorParams) => string;
}

export interface GeneratorParams {
  projectName: string;
  resourceName: string;
  version: string;
  template: Record<string, unknown>;
  allowedEndpoints?: {
    get: boolean;
    getById: boolean;
    post: boolean;
    put: boolean;
    delete: boolean;
  };
}

export { generateFastAPICode } from './fastapi';
export { generateExpressCode } from './express';
export { generateReactCode } from './react';
export { generateNextJSRoute } from './nextjs'; 