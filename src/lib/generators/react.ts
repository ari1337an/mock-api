import { toPascalCase } from "@/utils/string";
export function generateReactCode(
  projectName: string,
  resourceName: string,
  version: string,
  template: Record<string, unknown>
): string {
  const resourceType = toPascalCase(resourceName);
  
  return `
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

export interface ${resourceType} {
${generateTypeDefinition(template)}
  id: string;
}

export interface Create${resourceType}Dto {
${generateTypeDefinition(template)}
}

export const ${resourceName}Api = {
  create: async (data: Create${resourceType}Dto): Promise<${resourceType}> => {
    const response = await api.post<${resourceType}>('/${version}/${resourceName}', data);
    return response.data;
  },

  getAll: async (): Promise<${resourceType}[]> => {
    const response = await api.get<${resourceType}[]>('/${version}/${resourceName}');
    return response.data;
  },

  getById: async (id: string): Promise<${resourceType}> => {
    const response = await api.get<${resourceType}>('/${version}/${resourceName}/' + id);
    return response.data;
  },

  update: async (id: string, data: Create${resourceType}Dto): Promise<${resourceType}> => {
    const response = await api.put<${resourceType}>('/${version}/${resourceName}/' + id, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete('/${version}/${resourceName}/' + id);
  }
};

// Example React Hook
export function use${resourceType}s() {
  const [data, setData] = useState<${resourceType}[]>([]);
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
`;
}

function generateTypeDefinition(template: Record<string, unknown>): string {
  return Object.entries(template)
    .map(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('$')) {
        return `  ${key}: string;`;
      }
      return `  ${key}: ${typeof value};`;
    })
    .join('\n');
} 