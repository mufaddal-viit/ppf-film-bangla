'use client';

import { useActionState, useEffect, useRef, useTransition, type ReactNode } from 'react';
import type { FormAction } from '@/lib/admin/form-state';
import { cn } from '@/lib/cn';
import { Spinner } from './spinner';

type AdminFormProps = {
  action: FormAction;
  submitLabel: string;
  children: ReactNode;
  className?: string;
  /** Clear the inputs after a successful submit (for "add" forms). Edit forms keep their values. */
  resetOnSuccess?: boolean;
  /** Secondary look for the submit button, for less important forms on a page. */
  quiet?: boolean;
};

/** One form shell for every admin mutation: pending state, field errors and the result message. */
export function AdminForm({ action, submitLabel, children, className, resetOnSuccess, quiet }: AdminFormProps) {
  const [state, formAction] = useActionState(action, null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.ok) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={cn('c-admin-form', className)}
      // Submitting by hand keeps what the user typed when the server rejects the form;
      // a plain form action would reset every input.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {children}
      {!pending && state?.fieldErrors && (
        <ul className="c-admin-form-errors">
          {Object.entries(state.fieldErrors).map(([field, message]) => (
            <li key={field}>{message}</li>
          ))}
        </ul>
      )}
      <div className="c-admin-form-foot">
        <button
          type="submit"
          className="c-button inline-flex items-center justify-center gap-2"
          data-variant={quiet ? undefined : 'primary'}
          disabled={pending}
        >
          {pending && <Spinner />}
          {pending ? 'Please wait…' : submitLabel}
        </button>
        {!pending && state && (
          <p role="status" className="c-admin-form-message" data-ok={state.ok}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
