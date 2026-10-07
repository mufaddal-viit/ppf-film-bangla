import type { FeaturesConfig } from '../src/lib/config/schema';

export const features = {
  /** Posts are written in the admin panel (/admin/blog) and stored in the database. */
  blog: true,
  /** Keep false until testimonials and config/site.ts facts.rating are real. */
  reviewStructuredData: false,
} satisfies FeaturesConfig;
