'use server';

import * as auth from '@/lib/admin/auth';
import type { FormState } from '@/lib/admin/form-state';
import * as leads from '@/lib/admin/leads';
import * as users from '@/lib/admin/users';

/**
 * Admin server actions. Each one is a public endpoint: the session, origin and role checks
 * run inside (src/lib/admin/action.ts), never only in the page that renders the form.
 */

export async function login(previous: FormState, formData: FormData): Promise<FormState> {
  return auth.login(previous, formData);
}

export async function logout(): Promise<void> {
  await auth.logout();
}

export async function changePassword(previous: FormState, formData: FormData): Promise<FormState> {
  return auth.changePassword(previous, formData);
}

export async function createUser(previous: FormState, formData: FormData): Promise<FormState> {
  return users.createUser(previous, formData);
}

export async function updateUser(previous: FormState, formData: FormData): Promise<FormState> {
  return users.updateUser(previous, formData);
}

export async function resetUserPassword(previous: FormState, formData: FormData): Promise<FormState> {
  return users.resetUserPassword(previous, formData);
}

export async function updateLeadStatus(previous: FormState, formData: FormData): Promise<FormState> {
  return leads.updateLeadStatus(previous, formData);
}

export async function updateLeadFollowUp(previous: FormState, formData: FormData): Promise<FormState> {
  return leads.updateLeadFollowUp(previous, formData);
}

export async function addLeadNote(previous: FormState, formData: FormData): Promise<FormState> {
  return leads.addLeadNote(previous, formData);
}
