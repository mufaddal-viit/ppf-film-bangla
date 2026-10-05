import type { FeaturesConfig } from '../src/lib/config/schema';

export const features = {
  // The Fossil site has no blog; the sample post was written for the previous brand.
  blog: false,
  /** Keep false until testimonials and config/site.ts facts.rating are real. */
  reviewStructuredData: false,
} satisfies FeaturesConfig;
