/**
 * Structured JSON logging. Context values are limited to primitives, and keys that
 * could carry personal data are redacted, so leads never end up in log storage.
 */
type LogContext = Record<string, string | number | boolean | null | undefined>;
type Level = 'info' | 'warn' | 'error';

const PII_KEYS = /name|phone|email|message|ip|address|token|vehicle/i;

function redact(context: LogContext): LogContext {
  return Object.fromEntries(Object.entries(context).map(([k, v]) => [k, PII_KEYS.test(k) ? '[redacted]' : v]));
}

function write(level: Level, event: string, context: LogContext = {}, error?: unknown) {
  const entry = {
    level,
    event,
    time: new Date().toISOString(),
    ...redact(context),
    // Error name and message only: stacks and causes can embed user input.
    ...(error instanceof Error && { error: { name: error.name, message: error.message } }),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (event: string, context?: LogContext) => write('info', event, context),
  warn: (event: string, context?: LogContext, error?: unknown) => write('warn', event, context, error),
  error: (event: string, context?: LogContext, error?: unknown) => write('error', event, context, error),
};
