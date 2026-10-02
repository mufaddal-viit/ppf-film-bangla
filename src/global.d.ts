import type messages from '../content/en/messages.json';

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
  }
}
