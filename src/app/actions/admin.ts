'use server';

import * as auth from '@/lib/admin/auth';
import * as customers from '@/lib/admin/customers';
import type { FormState } from '@/lib/admin/form-state';
import * as installationActions from '@/lib/admin/installations';
import * as leads from '@/lib/admin/leads';
import * as posts from '@/lib/admin/posts';
import * as products from '@/lib/admin/products';
import * as stock from '@/lib/admin/stock';
import * as users from '@/lib/admin/users';
import * as vendors from '@/lib/admin/vendors';

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

export async function convertLeadToCustomer(previous: FormState, formData: FormData): Promise<FormState> {
  return customers.convertLeadToCustomer(previous, formData);
}

export async function createCustomer(previous: FormState, formData: FormData): Promise<FormState> {
  return customers.createCustomer(previous, formData);
}

export async function updateCustomer(previous: FormState, formData: FormData): Promise<FormState> {
  return customers.updateCustomer(previous, formData);
}

export async function addCustomerVehicle(previous: FormState, formData: FormData): Promise<FormState> {
  return customers.addCustomerVehicle(previous, formData);
}

export async function removeCustomerVehicle(previous: FormState, formData: FormData): Promise<FormState> {
  return customers.removeCustomerVehicle(previous, formData);
}

export async function addCustomerNote(previous: FormState, formData: FormData): Promise<FormState> {
  return customers.addCustomerNote(previous, formData);
}

export async function markCustomerContacted(previous: FormState, formData: FormData): Promise<FormState> {
  return customers.markCustomerContacted(previous, formData);
}

export async function savePost(previous: FormState, formData: FormData): Promise<FormState> {
  return posts.savePost(previous, formData);
}

export async function deletePost(previous: FormState, formData: FormData): Promise<FormState> {
  return posts.deletePost(previous, formData);
}

export async function createProduct(previous: FormState, formData: FormData): Promise<FormState> {
  return products.createProduct(previous, formData);
}

export async function updateProduct(previous: FormState, formData: FormData): Promise<FormState> {
  return products.updateProduct(previous, formData);
}

export async function allocateRoll(previous: FormState, formData: FormData): Promise<FormState> {
  return stock.allocateRoll(previous, formData);
}

export async function removeRoll(previous: FormState, formData: FormData): Promise<FormState> {
  return stock.removeRoll(previous, formData);
}

export async function createVendor(previous: FormState, formData: FormData): Promise<FormState> {
  return vendors.createVendor(previous, formData);
}

export async function updateVendor(previous: FormState, formData: FormData): Promise<FormState> {
  return vendors.updateVendor(previous, formData);
}

export async function createVendorLogin(previous: FormState, formData: FormData): Promise<FormState> {
  return vendors.createVendorLogin(previous, formData);
}

export async function resetVendorLoginPassword(previous: FormState, formData: FormData): Promise<FormState> {
  return vendors.resetVendorLoginPassword(previous, formData);
}

export async function setVendorLoginActive(previous: FormState, formData: FormData): Promise<FormState> {
  return vendors.setVendorLoginActive(previous, formData);
}

export async function voidInstallation(previous: FormState, formData: FormData): Promise<FormState> {
  return installationActions.voidInstallation(previous, formData);
}
