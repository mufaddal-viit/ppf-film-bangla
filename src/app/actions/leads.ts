'use server';

import type { ActionResult } from '@/lib/errors';
import { leadAction } from '@/lib/leads';

const quote = leadAction('quote');
const contact = leadAction('contact');
const callback = leadAction('callback');

export async function submitQuote(input: unknown): Promise<ActionResult<null>> {
  return quote(input);
}

export async function submitContact(input: unknown): Promise<ActionResult<null>> {
  return contact(input);
}

export async function submitCallback(input: unknown): Promise<ActionResult<null>> {
  return callback(input);
}
