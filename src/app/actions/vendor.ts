'use server';

import type { FormState } from '@/lib/admin/form-state';
import * as auth from '@/lib/vendor/auth';
import * as installations from '@/lib/vendor/installations';

/**
 * Vendor portal server actions. Each one is a public endpoint: the session and origin checks
 * run inside (src/lib/vendor/auth.ts), never only in the page that renders the form.
 */

export async function vendorLogin(previous: FormState, formData: FormData): Promise<FormState> {
  return auth.vendorLogin(previous, formData);
}

export async function vendorLogout(): Promise<void> {
  await auth.vendorLogout();
}

export async function vendorChangePassword(previous: FormState, formData: FormData): Promise<FormState> {
  return auth.vendorChangePassword(previous, formData);
}

export async function recordInstallation(previous: FormState, formData: FormData): Promise<FormState> {
  return installations.recordInstallation(previous, formData);
}
