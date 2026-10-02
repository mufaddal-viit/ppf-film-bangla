import type { SectionKey } from '@/lib/config/schema';
import type { SectionCopy, SectionData } from '@/lib/content';

export type SectionOf<K extends SectionKey> = Extract<SectionCopy, { key: K }> & { id: string };

export type SectionProps<K extends SectionKey> = {
  section: SectionOf<K>;
  data: SectionData;
};
