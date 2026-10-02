import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Landmark wrapper used by every content section: one <h2> labels the region. */
export function Section({
  id,
  name,
  heading,
  intro,
  className,
  children,
}: {
  id: string;
  /** Section key, exposed as data-section for styling hooks. */
  name: string;
  heading: string;
  intro?: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} data-section={name} className={cn('c-section', className)}>
      <div className="c-container">
        <h2 id={headingId} className="c-section-heading">
          {heading}
        </h2>
        {intro && <p className="c-section-intro mb-6 text-muted-foreground">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
