import type { SeoConfig } from '../src/lib/config/schema';

export const seo = {
  titleTemplate: '%s | PPF Phantom',
  defaultOgImage: { src: '/og/default.jpg', width: 1200, height: 630 },
  aiCrawlers: {
    policy: 'allow',
    userAgents: [
      'GPTBot',
      'OAI-SearchBot',
      'ChatGPT-User',
      'ClaudeBot',
      'Claude-User',
      'Claude-SearchBot',
      'PerplexityBot',
      'Google-Extended',
      'Applebot-Extended',
      'CCBot',
    ],
  },
} satisfies SeoConfig;
