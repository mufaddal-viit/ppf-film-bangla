'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useMemo, useRef, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { submitCallback, submitContact, submitQuote } from '@/app/actions/leads';
import { Link } from '@/i18n/navigation';
import type { ActionEnvelope } from '@/lib/actions/pipeline';
import type { LeadFieldName, LeadType } from '@/lib/config/schema';
import type { LeadFormProps } from '@/lib/content';
import type { ActionResult } from '@/lib/errors';
import { getAttribution } from '@/lib/tracking/attribution';
import { track } from '@/lib/tracking/track';
import { buildLeadSchema, toFieldErrorCode } from '@/lib/validation/lead';
import { Turnstile, type TurnstileHandle } from './turnstile';

const ACTIONS: Record<LeadType, (input: ActionEnvelope) => Promise<ActionResult<null>>> = {
  quote: submitQuote,
  contact: submitContact,
  callback: submitCallback,
};

type FormValues = Partial<Record<LeadFieldName, string>> & { consent: boolean };

const INPUT_PROPS: Partial<Record<LeadFieldName, React.InputHTMLAttributes<HTMLInputElement>>> = {
  name: { type: 'text', autoComplete: 'name' },
  phone: { type: 'tel', autoComplete: 'tel', inputMode: 'tel', dir: 'ltr' },
  email: { type: 'email', autoComplete: 'email', dir: 'ltr' },
  vehicleMake: { type: 'text' },
  vehicleModel: { type: 'text' },
  vehicleYear: { type: 'text', inputMode: 'numeric', maxLength: 4 },
  preferredTime: { type: 'text' },
};

/** One lead form for every variant; which fields appear comes from config/forms.ts. */
export function LeadForm({
  variant,
  fields,
  serviceOptions,
  phoneRegion,
  privacyHref,
  turnstile,
  defaultService,
}: LeadFormProps & { defaultService?: string }) {
  const t = useTranslations('form');
  const locale = useLocale();
  const id = useId();
  const turnstileRef = useRef<TurnstileHandle>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string>();

  const schema = useMemo(
    () => buildLeadSchema({ fields, phoneRegion, serviceSlugs: serviceOptions.map((o) => o.value) }),
    [fields, phoneRegion, serviceOptions],
  );
  const form = useForm<FormValues>({
    // The schema is built from config at runtime, so its inferred types are wider than FormValues.
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    mode: 'onTouched',
    defaultValues: {
      ...Object.fromEntries(fields.map((f) => [f.name, ''])),
      ...(defaultService && { service: defaultService }),
      consent: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      ACTIONS[variant]({
        payload: { ...values, context: { locale, sourcePage: window.location.pathname, ...getAttribution() } },
        security: { turnstileToken: token, honeypot: honeypotRef.current?.value },
      }),
    onSuccess: (result) => {
      turnstileRef.current?.reset();
      if (result.ok) {
        track({ name: 'form_submit', form: variant });
        form.reset();
        return;
      }
      for (const [field, code] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(field as keyof FormValues, { message: code });
      }
    },
    onError: () => turnstileRef.current?.reset(),
  });

  const errorText = (code: string | undefined) => (code ? t(`errors.${toFieldErrorCode(code)}`) : null);
  const result = mutation.data;
  const awaitingToken = turnstile !== null && !token;

  if (result?.ok) {
    return (
      <p role="status" className="c-form-success c-card">
        {t('success')}
      </p>
    );
  }

  return (
    <form
      className="c-lead-form"
      aria-labelledby={`${id}-title`}
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <h3 id={`${id}-title`} className="text-lg font-semibold">
        {t(`title.${variant}`)}
      </h3>

      {fields.map(({ name, required }) => {
        const fieldId = `${id}-${name}`;
        const error = form.formState.errors[name]?.message;
        const describedBy = error ? `${fieldId}-error` : undefined;
        const common = {
          id: fieldId,
          className: 'c-input',
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
          'aria-required': required || undefined,
          ...form.register(name),
        };
        return (
          <div key={name} className="c-field">
            <label htmlFor={fieldId}>
              {t(`fields.${name}`)}
              {!required && <span className="text-muted-foreground"> {t('optional')}</span>}
            </label>
            {name === 'service' ? (
              <select {...common}>
                <option value="">{t('placeholders.servicePrompt')}</option>
                {serviceOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : name === 'message' ? (
              <textarea {...common} rows={4} maxLength={2000} />
            ) : (
              <input
                {...common}
                {...INPUT_PROPS[name]}
                {...(name === 'phone' && { placeholder: t('placeholders.phone') })}
              />
            )}
            {error && (
              <p id={`${fieldId}-error`} className="c-field-error">
                {errorText(error)}
              </p>
            )}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and assistive tech, filled in by naive bots. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>{t('honeypotLabel')}</label>
        <input ref={honeypotRef} id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="c-field">
        <div className="flex items-start gap-2">
          <input
            id={`${id}-consent`}
            type="checkbox"
            className="mt-1 size-5"
            aria-invalid={form.formState.errors.consent ? true : undefined}
            aria-describedby={form.formState.errors.consent ? `${id}-consent-error` : undefined}
            {...form.register('consent')}
          />
          <label htmlFor={`${id}-consent`}>
            {t('consent')}{' '}
            <Link href={privacyHref} className="underline">
              {t('consentLink')}
            </Link>
          </label>
        </div>
        {form.formState.errors.consent && (
          <p id={`${id}-consent-error`} className="c-field-error">
            {errorText(form.formState.errors.consent.message)}
          </p>
        )}
      </div>

      {turnstile && <Turnstile ref={turnstileRef} siteKey={turnstile.siteKey} locale={locale} onToken={setToken} />}

      {result && !result.ok && (
        <p role="alert" className="c-form-error c-field-error">
          {t(`result.${result.code}`)}
        </p>
      )}

      <button type="submit" className="c-button" data-variant="primary" disabled={mutation.isPending || awaitingToken}>
        {mutation.isPending ? t('submitting') : t(`submit.${variant}`)}
      </button>
    </form>
  );
}
