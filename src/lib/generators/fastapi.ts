import type { TemplateField } from "@/types/template";
import { toPascalCase } from "@/utils/string";


export function generateFastAPICode(
  projectName: string,
  resourceName: string,
  version: string,
  template: Record<string, unknown>
): string {
  const schemaName = toPascalCase(resourceName);
  const schemas = generatePydanticSchemas(template, schemaName);
  const endpoints = generateEndpoints(resourceName, version, schemaName);

  return `
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid

app = FastAPI(title="${projectName} API")

${schemas}

# In-memory storage
${resourceName}_db = {}

${endpoints}
`;
}

function generatePydanticSchemas(template: Record<string, unknown>, schemaName: string): string {
  // Convert object template to array format if needed
  const templateArray = Array.isArray(template) 
    ? template 
    : Object.entries(template).map(([key, value]) => ({
        key,
        type: typeof value === 'object' ? 'object' : 'simple',
        ...(typeof value === 'string' && value.startsWith('$') 
          ? parseTemplateString(value) 
          : {}),
      }));

  const fields = templateArray.map(field => {
    if (field.type === 'simple') {
      return `    ${field.key}: ${getPydanticType(field)}`;
    } else if (field.type === 'object') {
      return `    ${field.key}: ${generateNestedSchema(field)}`;
    } else if (field.type === 'array') {
      return `    ${field.key}: List[${getPydanticArrayType(field)}]`;
    }
    return '';
  }).filter(Boolean).join('\n');

  return `
class ${schemaName}Base(BaseModel):
${fields}

class ${schemaName}Create(${schemaName}Base):
    pass

class ${schemaName}(${schemaName}Base):
    id: str
`;
}

function parseTemplateString(value: string) {
  const [module, method] = value.slice(1).split('.');
  return { module, method };
}

function generateEndpoints(resourceName: string, version: string, schemaName: string): string {
  return `
@app.post("/${version}/${resourceName}", response_model=${schemaName})
async def create_${resourceName}(item: ${schemaName}Create):
    item_dict = item.dict()
    item_id = str(uuid.uuid4())
    new_item = ${schemaName}(id=item_id, **item_dict)
    ${resourceName}_db[item_id] = new_item
    return new_item

@app.get("/${version}/${resourceName}", response_model=List[${schemaName}])
async def list_${resourceName}():
    return list(${resourceName}_db.values())

@app.get("/${version}/${resourceName}/{item_id}", response_model=${schemaName})
async def get_${resourceName}(item_id: str):
    if item_id not in ${resourceName}_db:
        raise HTTPException(status_code=404, detail="${resourceName} not found")
    return ${resourceName}_db[item_id]

@app.put("/${version}/${resourceName}/{item_id}", response_model=${schemaName})
async def update_${resourceName}(item_id: str, item: ${schemaName}Create):
    if item_id not in ${resourceName}_db:
        raise HTTPException(status_code=404, detail="${resourceName} not found")
    update_item = ${schemaName}(id=item_id, **item.dict())
    ${resourceName}_db[item_id] = update_item
    return update_item

@app.delete("/${version}/${resourceName}/{item_id}")
async def delete_${resourceName}(item_id: str):
    if item_id not in ${resourceName}_db:
        raise HTTPException(status_code=404, detail="${resourceName} not found")
    del ${resourceName}_db[item_id]
    return {"message": "${resourceName} deleted"}
`;
}

function getPydanticType(field: TemplateField): string {
  // Map faker types to Pydantic types
  const typeMap: Record<string, string> = {
    'userName': 'str',
    'email': 'str',
    'firstName': 'str',
    'lastName': 'str',
    'int': 'int',
    'float': 'float',
    'boolean': 'bool',
    'date': 'datetime',
    // Add more mappings as needed
  };

  return field.method ? typeMap[field.method] || 'str' : 'str';
}

function getPydanticArrayType(field: TemplateField): string {
  if (field.arrayType === 'simple') {
    return getPydanticType(field.items!);
  }
  return generateNestedSchema(field.items!);
}

function generateNestedSchema(field: TemplateField): string {
  if (!field.fields) return 'dict';
  
  const fields = field.fields.map(f => 
    `        ${f.key}: ${getPydanticType(f)}`
  ).join('\n');

  return `dict #{\n${fields}\n    }`;
} 