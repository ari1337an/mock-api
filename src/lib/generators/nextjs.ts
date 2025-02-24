import type { GeneratorParams } from "./index";
import { toPascalCase } from "@/utils/string";

// Step 1: Initial setup with GET all endpoint
export function generateInitialSetup({ resourceName, template, allowedEndpoints }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  
  if (!allowedEndpoints?.get) {
    return '// No GET endpoint selected';
  }

  return `/** ${resourceName}/route.ts */
import { NextRequest, NextResponse } from "next/server";

interface ${typeName}Data {
  id: string;
${Object.entries(template)
    .map(([key, value]) => `  ${key}: ${typeof value};`)
    .join('\n')}
}

interface ${typeName}Response {
  data: ${typeName}Data[];
}

// In-memory storage
const ${resourceName}DB = new Map<string, ${typeName}Data>();

export async function GET(req: NextRequest) {
  const data = Array.from(${resourceName}DB.values());
  return NextResponse.json({ data });
}`;
}

// Step 3: Setup [id] route with GET by ID
export function generateGetByIdEndpoint({ resourceName }: GeneratorParams): string {
  return `/** ${resourceName}/[id]/route.ts */
import { NextRequest, NextResponse } from "next/server";
import { getErrorResponse } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const item = ${resourceName}DB.get(id);

  if (!item) {
    return getErrorResponse(404, "${resourceName} not found");
  }

  return NextResponse.json(item);
}`;
}

// Step 4: Add PUT endpoint
export function generatePutEndpoint({ resourceName }: GeneratorParams): string {
  return `/** ${resourceName}/[id]/route.ts */

// ... existing imports and types ...

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!validateData(body)) {
      return getErrorResponse(400, "Invalid request body");
    }

    const response = { ...body, id };
    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return getErrorResponse(500, "Internal server error");
  }
}`;
}

// Step 5: Add DELETE endpoint
export function generateDeleteEndpoint({ resourceName }: GeneratorParams): string {
  return `/** ${resourceName}/[id]/route.ts */

// ... existing imports and types ...

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const exists = mockData.some(d => d.id === id);
    
    if (!exists) {
      return getErrorResponse(404, "${resourceName} not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return getErrorResponse(500, "Internal server error");
  }
}`;
}

// Add the missing POST endpoint generator
export function generateNextPost({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `export async function POST(request: NextRequest) {
  const data = await request.json() as ${typeName}Create;
  const id = crypto.randomUUID();
  const newItem = { ...data, id };
  
  ${resourceName}DB.set(id, newItem);
  return NextResponse.json(newItem, { status: 201 });
}`;
}

// Update the main generator function
export function generateNextJSRoute(params: GeneratorParams): string {
  const { resourceName, allowedEndpoints } = params;
  const files: { path: string; content: string }[] = [];

  // Main route file (GET all and POST)
  if (allowedEndpoints?.get || allowedEndpoints?.post) {
    let mainRouteContent = generateInitialSetup(params);
    if (allowedEndpoints?.post) {
      mainRouteContent += '\n\n' + generateNextPost(params);  // Use the new function
    }
    files.push({ path: `${resourceName}/route.ts`, content: mainRouteContent });
  }

  // [id] route file (GET by ID, PUT, DELETE)
  if (allowedEndpoints?.getById || allowedEndpoints?.put || allowedEndpoints?.delete) {
    let idRouteContent = '';
    if (allowedEndpoints?.getById) {
      idRouteContent = generateGetByIdEndpoint(params);
    }
    if (allowedEndpoints?.put) {
      idRouteContent += '\n\n' + generatePutEndpoint(params);
    }
    if (allowedEndpoints?.delete) {
      idRouteContent += '\n\n' + generateDeleteEndpoint(params);
    }
    files.push({ path: `${resourceName}/[id]/route.ts`, content: idRouteContent });
  }

  return files.map(file => `// ${file.path}\n${file.content}`).join('\n\n// ========================================\n\n');
}

export function generateNextGetAll({ resourceName }: GeneratorParams): string {
  return `export async function GET(req: NextRequest) {
  const data = Array.from(${resourceName}DB.values());
  return NextResponse.json({ data });
}`;
}

export function generateNextGetById({ resourceName }: GeneratorParams): string {
  return `export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const item = ${resourceName}DB.get(id);

  if (!item) {
    return getErrorResponse(404, "${resourceName} not found");
  }

  return NextResponse.json(item);
}`;
}

// Export all the generator functions
export function generateNextTypes({ resourceName, template }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `interface ${typeName}Data {
  id: string;
${Object.entries(template)
    .map(([key, value]) => `  ${key}: ${typeof value};`)
    .join('\n')}
}

interface ${typeName}Response {
  data: ${typeName}Data[];
}

interface ${typeName}Create extends Omit<${typeName}Data, 'id'> {}`;
}

// Update the mock data generator to use the latest faker methods
function generateMockData(template: Record<string, unknown>, count: number = 3): Array<Record<string, unknown>> {
  // Map of deprecated methods to their new versions
  const fakerMethodMap: Record<string, string> = {
    'internet.userName': 'internet.username',
    'address.streetAddress': 'location.streetAddress',
    'address.city': 'location.city',
    'address.state': 'location.state',
    'address.country': 'location.country',
    'address.zipCode': 'location.zipCode',
  };

  return Array.from({ length: count }, (_, index) => ({
    id: `mock-${index + 1}`,
    ...Object.entries(template).reduce((acc, [key, value]) => {
      if (typeof value === 'string' && value.startsWith('$')) {
        // Parse faker method and check for deprecated methods
        const methodPath = value.slice(1); // Remove the $ prefix
        const updatedPath = fakerMethodMap[methodPath] || methodPath;
        acc[key] = `\${faker.${updatedPath}()}`; // Use updated method path
      } else if (Array.isArray(value)) {
        acc[key] = value.map(item => {
          if (typeof item === 'string' && item.startsWith('$')) {
            const methodPath = item.slice(1);
            const updatedPath = fakerMethodMap[methodPath] || methodPath;
            return `\${faker.${updatedPath}()}`;
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null) {
        acc[key] = generateMockData(value as Record<string, unknown>, 1)[0];
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>)
  }));
}

// Update the setup function to import faker
export function generateNextSetup({ resourceName, template }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `import { NextRequest, NextResponse } from "next/server";
import { getErrorResponse } from "@/lib/utils";
import { faker } from '@faker-js/faker';

// In-memory storage
const ${resourceName}DB = new Map<string, ${typeName}Data>();

// Initialize with mock data
const mockData = [
${generateMockData(template, 3).map(data => `  ${JSON.stringify(data, null, 2)}`).join(',\n')}
].map(item => ({
  ...item,
  id: crypto.randomUUID() // Generate real UUIDs for the IDs
}));

// Populate DB with mock data
mockData.forEach(data => {
  ${resourceName}DB.set(data.id, data);
});`;
}

export function generateNextCreate({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `export async function POST(request: NextRequest) {
  const data = await request.json() as ${typeName}Create;
  const id = crypto.randomUUID();
  const newItem = { ...data, id };
  
  ${resourceName}DB.set(id, newItem);
  return NextResponse.json(newItem, { status: 201 });
}`;
}

export function generateNextUpdate({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data = await request.json() as ${typeName}Create;

  if (!${resourceName}DB.has(id)) {
    return getErrorResponse(404, "${resourceName} not found");
  }

  const updatedItem = { ...data, id };
  ${resourceName}DB.set(id, updatedItem);
  return NextResponse.json(updatedItem);
}`;
}

export function generateNextDelete({ resourceName }: GeneratorParams): string {
  return `export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  if (!${resourceName}DB.has(id)) {
    return getErrorResponse(404, "${resourceName} not found");
  }

  ${resourceName}DB.delete(id);
  return NextResponse.json({ success: true });
}`;
} 