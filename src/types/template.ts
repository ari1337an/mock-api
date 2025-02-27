export interface TemplateField {
  key: string;
  type: "simple" | "object" | "array";
  arrayType?: "simple" | "object";
  module?: string;
  method?: string;
  params?: string[];
  fields?: TemplateField[];
  items?: TemplateField;
  count?: number;
} 