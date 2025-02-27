import { z } from 'zod';

export const EndpointSchema = z.object({
  get: z.boolean().default(false),
  getById: z.boolean().default(false),
  post: z.boolean().default(false),
  put: z.boolean().default(false),
  delete: z.boolean().default(false)
});

export type EndpointState = z.infer<typeof EndpointSchema>; 