'use client';

import { lazy, Suspense, useRef, type ComponentProps } from 'react';
import { useNearViewport } from './use-near-viewport';

const LeadForm = lazy(() => import('./lead-form').then((m) => ({ default: m.LeadForm })));

/**
 * Loads the form's JavaScript (validation, phone parsing, Turnstile) only when the form
 * approaches the viewport, so it never competes with the hero for bandwidth or CPU.
 * The reserved min-height prevents layout shift when it mounts.
 */
export function LazyLeadForm(props: ComponentProps<typeof LeadForm>) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);
  return (
    <div ref={ref} className="c-lead-form-slot min-h-[32rem]">
      {near && (
        <Suspense fallback={null}>
          <LeadForm {...props} />
        </Suspense>
      )}
    </div>
  );
}
