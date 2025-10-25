import { z } from 'zod';

export const getSchemaBase = (schema: z.ZodObject<any>) => {
  const base: Record<'required' | 'defaults', any> = {
    defaults: {},
    required: {}
  };
  for (const key in schema.shape) {
    const field = schema.shape[key];
    const b = field.safeParse(undefined); // ensure default is set
    base['defaults'][key] = b.success ? b.data : undefined;
    base['required'][key] = !b.success;
  }
  return base;
};
