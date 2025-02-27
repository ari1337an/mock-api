import type { GeneratorParams } from "./index";
import { toPascalCase } from "@/utils/string";

export function generateReactTypes({ resourceName, template }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  const fields = Object.entries(template)
    .map(([key, value]) => {
      if (typeof value === 'string') return `  ${key}: string;`;
      if (typeof value === 'number') return `  ${key}: number;`;
      if (typeof value === 'boolean') return `  ${key}: boolean;`;
      return `  ${key}: any;`;
    })
    .join('\n');

  return `export interface ${typeName} {
  id: string;
${fields}
}

export interface ${typeName}Create extends Omit<${typeName}, 'id'> {}

export interface ${typeName}Response {
  data: ${typeName}[];
}`;
}

export function generateReactApi({ resourceName, version }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  
  return `import axios from 'axios';
import type { ${typeName}, ${typeName}Create, ${typeName}Response } from '../types/${resourceName}';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

export const ${resourceName}Api = {
  getAll: async (): Promise<${typeName}[]> => {
    const response = await api.get<${typeName}Response>('/${version}/${resourceName}');
    return response.data.data;
  },

  getById: async (id: string): Promise<${typeName}> => {
    const response = await api.get<${typeName}>(\`/${version}/${resourceName}/\${id}\`);
    return response.data;
  },

  create: async (data: ${typeName}Create): Promise<${typeName}> => {
    const response = await api.post<${typeName}>('/${version}/${resourceName}', data);
    return response.data;
  },

  update: async (id: string, data: ${typeName}Create): Promise<${typeName}> => {
    const response = await api.put<${typeName}>(\`/${version}/${resourceName}/\${id}\`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(\`/${version}/${resourceName}/\${id}\`);
  }
};`;
}

export function generateReactHooks({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  
  return `import { useState, useEffect } from 'react';
import type { ${typeName} } from '../types/${resourceName}';
import { ${resourceName}Api } from '../api/${resourceName}';

export function use${typeName}s() {
  const [data, setData] = useState<${typeName}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    ${resourceName}Api.getAll()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function use${typeName}(id: string) {
  const [data, setData] = useState<${typeName} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    ${resourceName}Api.getById(id)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}`;
}

// Keep the original function for backward compatibility
export function generateReactCode(projectName: string, resourceName: string, version: string, template: Record<string, unknown>): string {
  const params = { projectName, resourceName, version, template };
  return `${generateReactTypes(params)}\n\n${generateReactApi(params)}\n\n${generateReactHooks(params)}`;
} 