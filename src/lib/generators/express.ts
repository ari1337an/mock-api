import type { GeneratorParams } from "./index";
import { toPascalCase } from "@/utils/string";

export function generateExpressTypes({ resourceName, template }: GeneratorParams): string {
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

export function generateExpressRouter({ resourceName, template }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { ${typeName}, ${typeName}Create } from '../types/${resourceName}';

const router = express.Router();

// In-memory storage with mock data
const ${resourceName}DB = new Map<string, ${typeName}>(
${generateJSMockData(template, 3).map(data => 
    `  ["${data.id}", ${JSON.stringify(data)}]`
  ).join(',\n')}
);

export default router;`;
}

function generateJSMockData(template: Record<string, unknown>, count: number = 3): Array<Record<string, unknown>> {
  return Array.from({ length: count }, (_, index) => ({
    id: `mock-id-${index + 1}`,
    ...Object.entries(template).reduce((acc, [key, value]) => {
      if (typeof value === 'string' && value.startsWith('$')) {
        acc[key] = `Mock ${key} ${index + 1}`;
      } else if (Array.isArray(value)) {
        acc[key] = value.map((item, i) => 
          typeof item === 'string' && item.startsWith('$') 
            ? `Mock ${key} Item ${i + 1}` 
            : item
        );
      } else if (typeof value === 'object' && value !== null) {
        acc[key] = generateJSMockData(value as Record<string, unknown>, 1)[0];
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>)
  }));
}

export function generateExpressHandlers({ resourceName, allowedEndpoints }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  const endpoints: string[] = [];
  
  // Only add uuid import if needed
  if (allowedEndpoints?.post) {
    endpoints.push(`import { v4 as uuidv4 } from 'uuid';`);
  }

  if (allowedEndpoints?.get) {
    endpoints.push(`
router.get('/', (req, res) => {
  const data = Array.from(${resourceName}DB.values());
  res.json({ data });
});`);
  }

  if (allowedEndpoints?.getById) {
    endpoints.push(`
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = ${resourceName}DB.get(id);
  
  if (!item) {
    return res.status(404).json({ message: '${resourceName} not found' });
  }
  
  res.json(item);
});`);
  }

  if (allowedEndpoints?.post) {
    endpoints.push(`
router.post('/', validate${typeName}, (req, res) => {
  const data = req.body as ${typeName}Create;
  const id = uuidv4();
  const new${typeName} = { ...data, id };
  
  ${resourceName}DB.set(id, new${typeName});
  res.status(201).json(new${typeName});
});`);
  }

  if (allowedEndpoints?.put) {
    endpoints.push(`
router.put('/:id', validate${typeName}, (req, res) => {
  const { id } = req.params;
  const data = req.body as ${typeName}Create;
  
  if (!${resourceName}DB.has(id)) {
    return res.status(404).json({ message: '${resourceName} not found' });
  }
  
  const updated${typeName} = { ...data, id };
  ${resourceName}DB.set(id, updated${typeName});
  res.json(updated${typeName});
});`);
  }

  if (allowedEndpoints?.delete) {
    endpoints.push(`
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  if (!${resourceName}DB.has(id)) {
    return res.status(404).json({ message: '${resourceName} not found' });
  }
  
  ${resourceName}DB.delete(id);
  res.status(204).send();
});`);
  }

  return endpoints.join('\n\n');
}

export function generateExpressGetAll({ resourceName }: GeneratorParams): string {
  return `router.get('/', (req, res) => {
  const data = Array.from(${resourceName}DB.values());
  res.json({ data });
});`;
}

export function generateExpressGetOne({ resourceName }: GeneratorParams): string {
  return `router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = ${resourceName}DB.get(id);
  
  if (!item) {
    return res.status(404).json({ message: '${resourceName} not found' });
  }
  
  res.json(item);
});`;
}

export function generateExpressCreate({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `router.post('/', validate${typeName}, (req, res) => {
  const data = req.body as ${typeName}Create;
  const id = crypto.randomUUID();
  const new${typeName} = { ...data, id };
  
  ${resourceName}DB.set(id, new${typeName});
  res.status(201).json(new${typeName});
});`;
}

export function generateExpressUpdate({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `router.put('/:id', validate${typeName}, (req, res) => {
  const { id } = req.params;
  const data = req.body as ${typeName}Create;
  
  if (!${resourceName}DB.has(id)) {
    return res.status(404).json({ message: '${resourceName} not found' });
  }
  
  const updated${typeName} = { ...data, id };
  ${resourceName}DB.set(id, updated${typeName});
  res.json(updated${typeName});
});`;
}

export function generateExpressDelete({ resourceName }: GeneratorParams): string {
  return `router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  if (!${resourceName}DB.has(id)) {
    return res.status(404).json({ message: '${resourceName} not found' });
  }
  
  ${resourceName}DB.delete(id);
  res.status(204).send();
});`;
}

// Keep the original function for backward compatibility
export function generateExpressCode(projectName: string, resourceName: string, version: string, template: Record<string, unknown>): string {
  const params = { projectName, resourceName, version, template };
  return `${generateExpressTypes(params)}\n\n${generateExpressRouter(params)}\n\n${generateExpressHandlers(params)}`;
} 