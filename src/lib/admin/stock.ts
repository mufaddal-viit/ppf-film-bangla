import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { isDuplicateKeyError } from '@/lib/db/repositories/user.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { ActionError, adminAction } from './action';
import { ADMIN_ROUTES, ROLL_LIMITS } from './constants';
import { rollSize } from './format';

const idSchema = z.string().regex(/^[0-9a-f]{24}$/);

/** A measurement typed into a number box, kept to `decimals` places. */
function measurement(label: string, unit: string, { min, max }: { min: number; max: number }, decimals: number) {
  const step = 10 ** decimals;
  return z.coerce
    .number(`Enter the ${label} in ${unit}.`)
    .min(min, `The ${label} must be at least ${min} ${unit}.`)
    .max(max, `The ${label} can be at most ${max} ${unit}.`)
    .refine(
      (value) => Number.isInteger(Math.round(value * step * 1000) / 1000),
      decimals === 0
        ? `Enter the ${label} in whole ${unit}.`
        : `Enter the ${label} to at most ${decimals} decimal places.`,
    );
}

export const rollFormSchema = z.object({
  vendorId: idSchema,
  productId: idSchema,
  lotNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(3, 'Enter the LOT number printed on the roll.')
        .max(40, 'The LOT number is too long.')
        .regex(/^[A-Za-z0-9][A-Za-z0-9 ./_-]*$/, 'A LOT number can hold letters, numbers, spaces and . / _ - only.'),
    ),
  widthCm: measurement('width', 'centimetres', ROLL_LIMITS.widthCm, 1),
  lengthM: measurement('length', 'metres', ROLL_LIMITS.lengthM, 2),
});

function refresh(vendorId: string) {
  revalidatePath(ADMIN_ROUTES.stock);
  revalidatePath(`${ADMIN_ROUTES.vendors}/${vendorId}`);
  revalidatePath(VENDOR_ROUTES.dashboard);
  revalidatePath(VENDOR_ROUTES.stock);
}

/** Gives one roll to a shop. Only stock allocated here can later be used on an installation. */
export const allocateRoll = adminAction({
  name: 'stock.allocate',
  role: 'owner',
  schema: rollFormSchema,
  async handler(input, session) {
    const [vendor, product] = await Promise.all([
      vendorRepository.findById(input.vendorId),
      productRepository.findById(input.productId),
    ]);
    if (!vendor) throw new ActionError('That vendor no longer exists.');
    if (!vendor.active) throw new ActionError(`${vendor.shopName} is deactivated. Reactivate the shop first.`);
    if (!product) throw new ActionError('That product no longer exists.');
    if (!product.active) throw new ActionError(`${product.name} is retired. Put it back on sale first.`);
    try {
      await rollRepository.create(input);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ActionError('A roll with that LOT number has already been allocated.');
      throw error;
    }
    await auditRepository.record(
      session,
      'stock.allocated',
      `LOT ${input.lotNumber}`,
      `${product.name}, ${rollSize(input)}, to ${vendor.shopName}`,
    );
    refresh(vendor.id);
    return `LOT ${input.lotNumber} allocated to ${vendor.shopName}.`;
  },
});

/** Corrects a mistake: a roll can be taken back only while nothing has been cut from it. */
export const removeRoll = adminAction({
  name: 'stock.remove',
  role: 'owner',
  schema: z.object({ id: idSchema }),
  async handler({ id }, session) {
    const roll = await rollRepository.removeUnused(id);
    if (!roll) throw new ActionError('That roll is already in use or no longer exists, so it cannot be taken back.');
    await auditRepository.record(session, 'stock.removed', `LOT ${roll.lotNumber}`, rollSize(roll));
    refresh(roll.vendorId);
    return `LOT ${roll.lotNumber} taken back.`;
  },
});
