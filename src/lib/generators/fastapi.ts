import type { GeneratorParams } from "./index";
import { toPascalCase } from "@/utils/string";

// Types/Models
export function generateFastAPIModels({ resourceName, template }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `from pydantic import BaseModel
from typing import List, Any

class ${typeName}Base(BaseModel):
${Object.entries(template)
    .map(([key, value]) => `    ${key}: ${typeof value === 'string' ? 'str' : 'Any'}`)
    .join('\n')}

class ${typeName}Create(${typeName}Base):
    pass

class ${typeName}(${typeName}Base):
    id: str

class ${typeName}Response(BaseModel):
    data: List[${typeName}]`;
}

// Router Setup
export function generateFastAPIRouter({ resourceName, template }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `from fastapi import APIRouter, HTTPException
from uuid import uuid4
from .models import ${typeName}, ${typeName}Create, ${typeName}Response

router = APIRouter(prefix="/${resourceName}", tags=["${resourceName}"])

# In-memory storage
${resourceName}_db = {
${generatePythonMockData(template, 3).map(data => 
    `    "${data.id}": ${typeName}(**${JSON.stringify(data)})`
  ).join(',\n')}
}`;
}

function generatePythonMockData(template: Record<string, unknown>, count: number = 3): Array<Record<string, unknown>> {
  return Array.from({ length: count }, (_, index) => ({
    "id": `mock-id-${index + 1}`,
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
        acc[key] = generatePythonMockData(value as Record<string, unknown>, 1)[0];
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>)
  }));
}

// Individual Endpoints
export function generateFastAPIGetAll({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `@router.get("", response_model=${typeName}Response)
async def list_${resourceName}s():
    return {"data": list(${resourceName}_db.values())}`;
}

export function generateFastAPIGetOne({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `@router.get("/{item_id}", response_model=${typeName})
async def get_${resourceName}(item_id: str):
    if item_id not in ${resourceName}_db:
        raise HTTPException(status_code=404, detail="${resourceName} not found")
    return ${resourceName}_db[item_id]`;
}

export function generateFastAPICreate({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `@router.post("", response_model=${typeName}, status_code=201)
async def create_${resourceName}(item: ${typeName}Create):
    item_id = str(uuid4())
    new_item = ${typeName}(id=item_id, **item.dict())
    ${resourceName}_db[item_id] = new_item
    return new_item`;
}

export function generateFastAPIUpdate({ resourceName }: GeneratorParams): string {
  const typeName = toPascalCase(resourceName);
  return `@router.put("/{item_id}", response_model=${typeName})
async def update_${resourceName}(item_id: str, item: ${typeName}Create):
    if item_id not in ${resourceName}_db:
        raise HTTPException(status_code=404, detail="${resourceName} not found")
    updated_item = ${typeName}(id=item_id, **item.dict())
    ${resourceName}_db[item_id] = updated_item
    return updated_item`;
}

export function generateFastAPIDelete({ resourceName }: GeneratorParams): string {
  return `@router.delete("/{item_id}")
async def delete_${resourceName}(item_id: str):
    if item_id not in ${resourceName}_db:
        raise HTTPException(status_code=404, detail="${resourceName} not found")
    del ${resourceName}_db[item_id]
    return {"success": True}`;
}

// Update the main generator function to use the new modular functions
export function generateFastAPICode(projectName: string, resourceName: string, version: string, template: Record<string, unknown>): string {
  const params = { projectName, resourceName, version, template };
  return `${generateFastAPIModels(params)}\n\n${generateFastAPIRouter(params)}\n\n${generateFastAPIGetAll(params)}\n${generateFastAPIGetOne(params)}\n${generateFastAPICreate(params)}\n${generateFastAPIUpdate(params)}\n${generateFastAPIDelete(params)}`;
} 