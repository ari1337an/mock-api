import type { TemplateField } from "../types/template";

type TemplateValue = string | TemplateValue[] | { [key: string]: TemplateValue };

export const generateTemplate = (fields: TemplateField[]): Record<string, TemplateValue> => {
  return fields.reduce((acc: Record<string, TemplateValue>, field) => {
    if (!field.key) return acc;

    if (field.type === "simple" && field.module && field.method) {
      acc[field.key] = `$${field.module}.${field.method}`;
    } else if (field.type === "object" && field.fields) {
      acc[field.key] = generateTemplate(field.fields);
    } else if (field.type === "array" && field.items) {
      const count = field.count || 3;
      
      if (field.arrayType === "simple" && field.items.module && field.items.method) {
        // Generate a proper array of values
        const values = [];
        for (let i = 0; i < count; i++) {
          values.push(`$${field.items.module}.${field.items.method}`);
        }
        acc[field.key] = values;
      } else if (field.arrayType === "object" && field.items.fields) {
        // Generate array of objects
        const objects = [];
        for (let i = 0; i < count; i++) {
          objects.push(generateTemplate(field.items.fields || []));
        }
        acc[field.key] = objects;
      }
    }
    return acc;
  }, {});
};

export const toSlug = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}; 