import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { ActionError, adminAction } from './action';
import { ADMIN_ROUTES } from './constants';

const idSchema = z.string().regex(/^[0-9a-f]{24}$/);

function refreshPaths(vendorId: string, customerId: string) {
  revalidatePath(ADMIN_ROUTES.installations);
  revalidatePath(ADMIN_ROUTES.stock);
  revalidatePath(`${ADMIN_ROUTES.customers}/${customerId}`);
  revalidatePath(`${ADMIN_ROUTES.vendors}/${vendorId}`);
  revalidatePath(VENDOR_ROUTES.dashboard);
  revalidatePath(VENDOR_ROUTES.stock);
  revalidatePath(VENDOR_ROUTES.installations);
}

/** Void an installation and restore metres to the roll. Owner only. */
export const voidInstallation = adminAction({
  name: 'installation.void',
  role: 'owner',
  schema: z.object({
    id: idSchema,
    reason: z.string().trim().min(1, 'Give a reason for voiding.').max(500),
  }),
  async handler({ id, reason }, session) {
    const installation = await installationRepository.void(id, reason);
    if (!installation) throw new ActionError('That installation has already been voided or does not exist.');

    // Restore the metres to the roll (best effort — the roll may have been removed).
    await rollRepository.restoreMetres(installation.rollId, installation.metresUsed);

    await auditRepository.record(session, 'installation.voided', installation.warrantyNumber, reason);

    refreshPaths(installation.vendorId, installation.customerId);
    return `Installation ${installation.warrantyNumber} voided and ${installation.metresUsed} m restored to the roll.`;
  },
});
