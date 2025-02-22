import { z } from "zod";

type TemplateFieldSchemaType = z.ZodType<{
  key: string;
  type: "simple" | "object" | "array";
  arrayType?: "simple" | "object";
  module?: string;
  method?: string;
  params?: string[];
  fields?: Array<z.infer<typeof TemplateFieldSchema>>;
  items?: z.infer<typeof TemplateFieldSchema>;
  count?: number;
}>;

export const TemplateFieldSchema: TemplateFieldSchemaType = z.lazy(() => 
  z.object({
    key: z.string(),
    type: z.enum(["simple", "object", "array"]),
    arrayType: z.enum(["simple", "object"]).optional(),
    module: z.string().optional(),
    method: z.string().optional(),
    params: z.array(z.string()).optional(),
    fields: z.array(TemplateFieldSchema).optional(),
    items: TemplateFieldSchema.optional(),
    count: z.number().min(1).max(10).optional(),
  })
);

export const EditorStateSchema = z.object({
  mode: z.enum(["visual", "manual"]),
  template: z.string(),
});

export type EditorState = z.infer<typeof EditorStateSchema>; 