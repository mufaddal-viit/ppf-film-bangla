/**
 * Lead form schema, shared by the browser (React Hook Form) and the server action.
 * Built from the field config for a form variant so config decides which fields exist
 * and which are required. Error messages are codes from messages.json "form.errors".
 */
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/min';
import { z } from 'zod';
import type { LeadFieldName } from '@/lib/config/schema';

type LeadFieldConfig = { name: LeadFieldName; required: boolean };

/** Every error code the schema can produce. Each must exist in messages.json "form.errors". */
const FIELD_ERROR_CODES = [
  'required',
  'invalid_phone',
  'invalid_email',
  'too_long',
  'too_short',
  'invalid_year',
  'invalid_option',
  'consent_required',
  'invalid',
] as const;
type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

export function toFieldErrorCode(code: string | undefined): FieldErrorCode {
  return (FIELD_ERROR_CODES as readonly string[]).includes(code ?? '') ? (code as FieldErrorCode) : 'invalid';
}

type BuildOptions = {
  fields: readonly LeadFieldConfig[];
  phoneRegion: string;
  serviceSlugs: readonly string[];
};

/** Normalises any common UAE or international format to E.164, or returns null. */
export function normalizePhone(input: string, region: string): string | null {
  const parsed = parsePhoneNumberFromString(input, region as CountryCode);
  return parsed?.isValid() ? parsed.number : null;
}

const emptyToUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value);

function fieldSchemas({ phoneRegion, serviceSlugs }: Omit<BuildOptions, 'fields'>) {
  const text = (max: number, min = 1) =>
    z.string({ error: 'required' }).trim().min(min, 'too_short').max(max, 'too_long');
  const maxYear = new Date().getFullYear() + 1;

  return {
    name: text(100, 2),
    phone: z
      .string({ error: 'required' })
      .trim()
      .max(30, 'too_long')
      .transform((value, ctx) => {
        const e164 = normalizePhone(value, phoneRegion);
        if (!e164) {
          ctx.addIssue({ code: 'custom', message: 'invalid_phone' });
          return z.NEVER;
        }
        return e164;
      }),
    email: z.string({ error: 'required' }).trim().max(254, 'too_long').pipe(z.email('invalid_email')),
    vehicleMake: text(50),
    vehicleModel: text(50),
    vehicleYear: z.coerce
      .number({ error: 'invalid_year' })
      .int('invalid_year')
      .min(1950, 'invalid_year')
      .max(maxYear, 'invalid_year'),
    service: z.enum(serviceSlugs as [string, ...string[]], { error: 'invalid_option' }),
    preferredTime: text(100),
    message: text(2000),
  } satisfies Record<LeadFieldName, z.ZodType>;
}

export function buildLeadSchema({ fields, ...options }: BuildOptions) {
  const schemas = fieldSchemas(options);
  const shape: Record<string, z.ZodType> = {};
  for (const field of fields) {
    const base = schemas[field.name];
    shape[field.name] = z.preprocess(emptyToUndefined, field.required ? base : base.optional());
  }
  return z.object({
    ...shape,
    consent: z.literal(true, { error: 'consent_required' }),
  });
}

/** Typed view of a parsed lead; only fields enabled for the variant are present. */
export type ParsedLeadValues = Partial<{
  name: string;
  phone: string;
  email: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  service: string;
  preferredTime: string;
  message: string;
}> & { consent: true };

/** Attribution captured in the browser and sent with every lead. */
export const leadContextSchema = z.object({
  locale: z.string().min(2).max(8),
  sourcePage: z.string().startsWith('/').max(500),
  landingPage: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  utm: z
    .object({
      source: z.string().max(100).optional(),
      medium: z.string().max(100).optional(),
      campaign: z.string().max(100).optional(),
      term: z.string().max(100).optional(),
      content: z.string().max(100).optional(),
    })
    .optional(),
});
export type LeadContext = z.infer<typeof leadContextSchema>;

/** First error code per field, for display next to each input. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (key && !(key in out)) out[key] = issue.message;
  }
  return out;
}
