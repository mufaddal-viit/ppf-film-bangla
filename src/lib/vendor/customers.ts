import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ActionError } from '@/lib/admin/action';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { isDuplicateKeyError } from '@/lib/db/repositories/user.repository';
import { VENDOR_ROUTES } from './constants';
import { vendorAction } from './auth';

const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Enter a phone number.')
  .max(20)
  .regex(/^\+?[0-9\s-]+$/, 'Enter a valid phone number.');

export const createVendorCustomer = vendorAction({
  name: 'vendor.customer.create',
  schema: z.object({
    name: z.string().trim().min(1, 'Enter the customer name.').max(100),
    phone: phoneSchema,
    email: z.string().trim().email().max(254).optional().or(z.literal('')),
    make: z.string().trim().min(1, 'Enter the vehicle make.').max(40),
    model: z.string().trim().min(1, 'Enter the vehicle model.').max(40),
    year: z.coerce.number().int().min(1990).max(2100).optional(),
    plate: z.string().trim().max(20).optional(),
  }),
  async handler(input, session) {
    const vehicle = { make: input.make, model: input.model, year: input.year, plate: input.plate || undefined };
    try {
      await customerRepository.create({
        name: input.name,
        phone: input.phone,
        email: input.email || undefined,
        tags: [],
        marketingOptIn: false,
        vehicles: [vehicle],
        vendorId: session.vendorId,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ActionError('A customer with that phone number already exists.');
      throw error;
    }
    await auditRepository.record(session, 'vendor.customer.created', input.name, input.phone);
    revalidatePath(VENDOR_ROUTES.customers);
    return `Customer ${input.name} added.`;
  },
});

export const addVendorCustomerVehicle = vendorAction({
  name: 'vendor.customer.vehicle.add',
  schema: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/),
    make: z.string().trim().min(1, 'Enter the make.').max(40),
    model: z.string().trim().min(1, 'Enter the model.').max(40),
    year: z.coerce.number().int().min(1990).max(2100).optional(),
    plate: z.string().trim().max(20).optional(),
  }),
  async handler(input, session) {
    // Verify the customer belongs to this vendor.
    const customer = await customerRepository.findById(input.id);
    if (!customer || !(customer as Record<string, unknown>).vendorId) {
      throw new ActionError('Customer not found.');
    }
    await customerRepository.addVehicle(input.id, {
      make: input.make,
      model: input.model,
      year: input.year,
      plate: input.plate || undefined,
    });
    await auditRepository.record(
      session,
      'vendor.customer.vehicle_added',
      customer.name,
      `${input.make} ${input.model}`,
    );
    revalidatePath(`${VENDOR_ROUTES.customers}/${input.id}`);
    return `${input.make} ${input.model} added.`;
  },
});
