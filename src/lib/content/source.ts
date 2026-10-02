import type enMessages from '@content/en/messages.json';
import type { LocaleContentInput } from './schema';

type Messages = typeof enMessages;

/**
 * Where content comes from. Swap the implementation (database, headless CMS) without
 * touching components: everything downstream consumes the validated output of the loader.
 */
export interface ContentSource {
  loadContent(locale: string): Promise<LocaleContentInput>;
  loadMessages(locale: string): Promise<Messages>;
}

/** Add one line per locale when adding a language. */
const files: Record<string, { content: () => Promise<LocaleContentInput>; messages: () => Promise<Messages> }> = {
  en: {
    content: () => import('@content/en').then((m) => m.content),
    messages: () => import('@content/en/messages.json').then((m) => m.default),
  },
  ar: {
    content: () => import('@content/ar').then((m) => m.content),
    messages: () => import('@content/ar/messages.json').then((m) => m.default),
  },
};

function filesFor(locale: string) {
  const entry = files[locale];
  if (!entry) throw new Error(`No content files registered for locale "${locale}" in src/lib/content/source.ts`);
  return entry;
}

export const fileContentSource: ContentSource = {
  loadContent: (locale) => filesFor(locale).content(),
  loadMessages: (locale) => filesFor(locale).messages(),
};
