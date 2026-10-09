import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { isDuplicateKeyError } from '@/lib/db/repositories/user.repository';
import { ActionError, adminAction } from './action';
import { ADMIN_ROUTES, MAX_WARRANTY_YEARS } from './constants';

const idSchema = z.string().regex(/^[0-9a-f]{24}$/);
const DUPLICATE = 'A product with that name already exists.';

const checkbox = z
  .string()
  .optional()
  .transform((value) => value === 'on');

export const productFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter the product name.').max(80),
  finish: z.string().trim().min(2, 'Enter the finish, for example Gloss or Matte.').max(40),
  warrantyYears: z.coerce
    .number('Enter the warranty length in years.')
    .int('Enter whole years.')
    .min(1, 'The warranty must be at least 1 year.')
    .max(MAX_WARRANTY_YEARS, `The warranty can be at most ${MAX_WARRANTY_YEARS} years.`),
  description: z.string().trim().max(500),
});

function refresh() {
  revalidatePath(ADMIN_ROUTES.products);
}

export const createProduct = adminAction({
  name: 'product.create',
  role: 'owner',
  schema: productFormSchema,
  async handler(input, session) {
    try {
      await productRepository.create({ ...input, active: true });
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ActionError(DUPLICATE);
      throw error;
    }
    await auditRepository.record(session, 'product.created', input.name, `${input.warrantyYears} years`);
    refresh();
    return `${input.name} added.`;
  },
});

export const updateProduct = adminAction({
  name: 'product.update',
  role: 'owner',
  schema: productFormSchema.extend({ id: idSchema, active: checkbox }),
  async handler({ id, ...input }, session) {
    try {
      if (!(await productRepository.update(id, input))) throw new ActionError('That product no longer exists.');
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ActionError(DUPLICATE);
      throw error;
    }
    await auditRepository.record(
      session,
      'product.updated',
      input.name,
      `${input.warrantyYears} years, ${input.active ? 'active' : 'retired'}`,
    );
    refresh();
    revalidatePath(`${ADMIN_ROUTES.products}/${id}`);
    return 'Saved.';
  },
});
