import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ActionError } from '@/lib/admin/action';
import { ADMIN_ROUTES, ROLL_LIMITS } from '@/lib/admin/constants';
import { rollRemaining } from '@/lib/admin/format';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { VENDOR_ROUTES } from './constants';
import { vendorAction } from './auth';

const idSchema = z.string().regex(/^[0-9a-f]{24}$/);

export const installationFormSchema = z.object({
  customerId: idSchema,
  vehicleId: z.string().min(1, 'Pick a vehicle.'),
  rollId: idSchema,
  installer: z.string().trim().min(1, 'Pick an installer.').max(100),
  area: z.string().trim().min(1, 'Describe the area covered.').max(200),
  metresUsed: z.coerce
    .number('Enter the metres of film used.')
    .min(ROLL_LIMITS.lengthM.min, `At least ${ROLL_LIMITS.lengthM.min} m.`)
    .max(ROLL_LIMITS.lengthM.max, `At most ${ROLL_LIMITS.lengthM.max} m.`),
  installedAt: z.coerce.date('Enter the installation date.'),
});

function refreshPaths(vendorId: string, customerId: string) {
  revalidatePath(VENDOR_ROUTES.dashboard);
  revalidatePath(VENDOR_ROUTES.stock);
  revalidatePath(VENDOR_ROUTES.installations);
  revalidatePath(`${ADMIN_ROUTES.customers}/${customerId}`);
  revalidatePath(ADMIN_ROUTES.installations);
  revalidatePath(`${ADMIN_ROUTES.vendors}/${vendorId}`);
  revalidatePath(ADMIN_ROUTES.stock);
}

export const recordInstallation = vendorAction({
  name: 'installation.record',
  schema: installationFormSchema,
  async handler(input, session) {
    // Validate the roll belongs to this vendor and has enough film.
    const roll = await rollRepository.findById(input.rollId);
    if (!roll || roll.vendorId !== session.vendorId) {
      throw new ActionError('That roll does not belong to your shop or no longer exists.');
    }
    const remaining = rollRemaining(roll);
    if (input.metresUsed > remaining) {
      throw new ActionError(`That roll only has ${remaining} m left. You entered ${input.metresUsed} m.`);
    }

    // Validate customer and vehicle.
    const customer = await customerRepository.findById(input.customerId);
    if (!customer) throw new ActionError('That customer no longer exists.');
    const vehicle = customer.vehicles.find((v) => v.id === input.vehicleId);
    if (!vehicle) throw new ActionError('That vehicle no longer exists on this customer.');

    // Validate installer is listed on the vendor.
    if (!session.vendor.installers.includes(input.installer)) {
      throw new ActionError('That installer is not listed at your shop. Ask the owner to add them.');
    }

    // Look up the product for warranty years.
    const product = await productRepository.findById(roll.productId);
    if (!product) throw new ActionError('The product for this roll no longer exists.');

    const warrantyExpiresAt = new Date(input.installedAt);
    warrantyExpiresAt.setFullYear(warrantyExpiresAt.getFullYear() + product.warrantyYears);

    // Atomically deduct metres from the roll.
    const deducted = await rollRepository.deductMetres(roll.id, input.metresUsed);
    if (!deducted) {
      throw new ActionError('Not enough film left on that roll. Another installation may have used it just now.');
    }

    const { warrantyNumber } = await installationRepository.create({
      customerId: customer.id,
      vehicleId: input.vehicleId,
      vendorId: session.vendorId,
      rollId: roll.id,
      productId: product.id,
      installer: input.installer,
      area: input.area,
      metresUsed: input.metresUsed,
      installedAt: input.installedAt,
      warrantyExpiresAt,
    });

    await auditRepository.record(
      session,
      'installation.recorded',
      warrantyNumber,
      `${product.name} on ${vehicle.make} ${vehicle.model} for ${customer.name}`,
    );

    refreshPaths(session.vendorId, customer.id);
    return `Installation recorded. Warranty number: ${warrantyNumber}`;
  },
});
