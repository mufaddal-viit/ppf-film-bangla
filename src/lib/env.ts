import 'server-only';
import { parseEnv } from './env.schema';

/** Validated server environment. Never import from client components. */
export const env = parseEnv(process.env);
