import type { FeaturesConfig } from '../src/lib/config/schema';

export const features = {
  blog: true,
  /** Keep false until testimonials and config/site.ts facts.rating are real. */
  reviewStructuredData: false,
} satisfies FeaturesConfig;
