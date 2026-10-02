import { serializeJsonLd, type JsonLd as JsonLdData } from '@/lib/seo/jsonld';

/** The only place dangerouslySetInnerHTML is allowed: serialised, escaped JSON-LD. */
export function JsonLd({ data }: { data: JsonLdData | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
