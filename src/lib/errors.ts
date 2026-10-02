/** Stable error codes shared by server and client. The client maps them to messages.json "form.result". */
export type ErrorCode = 'RATE_LIMITED' | 'BOT_CHECK_FAILED' | 'VALIDATION_FAILED' | 'FORBIDDEN' | 'INTERNAL';

/** Field name -> error code (a key of messages.json "form.errors"). */
export type FieldErrors = Record<string, string>;

export type ActionResult<T> = { ok: true; data: T } | { ok: false; code: ErrorCode; fieldErrors?: FieldErrors };

export function fail(code: ErrorCode, fieldErrors?: FieldErrors): ActionResult<never> {
  return fieldErrors ? { ok: false, code, fieldErrors } : { ok: false, code };
}
