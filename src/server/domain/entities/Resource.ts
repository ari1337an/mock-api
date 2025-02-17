export interface Resource {
  id: string;
  name: string;
  endpoint: string;
  template: Record<string, SchemaField>;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  defaultValue?: string | number | boolean | Date | unknown[] | Record<string, unknown>;
}