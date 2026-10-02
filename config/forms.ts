import type { FormsConfig } from '../src/lib/config/schema';

/** Fields shown per lead form variant, in display order. Labels come from messages.json "form.fields". */
export const forms = {
  privacyPolicyVersion: '2026-10-01',
  variants: {
    quote: {
      fields: [
        { name: 'name', required: true },
        { name: 'phone', required: true },
        { name: 'email', required: false },
        { name: 'service', required: true },
        { name: 'vehicleMake', required: true },
        { name: 'vehicleModel', required: true },
        { name: 'vehicleYear', required: false },
        { name: 'message', required: false },
      ],
    },
    contact: {
      fields: [
        { name: 'name', required: true },
        { name: 'phone', required: true },
        { name: 'email', required: false },
        { name: 'message', required: true },
      ],
    },
    callback: {
      fields: [
        { name: 'name', required: true },
        { name: 'phone', required: true },
        { name: 'preferredTime', required: false },
      ],
    },
  },
} satisfies FormsConfig;
