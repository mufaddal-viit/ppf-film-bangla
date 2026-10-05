import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Landmark wrapper used by every content section: one <h2> labels the region. */
export function Section({
  id,
  name,
  heading,
  intro,
  tone,
  className,
  children,
}: {
  id: string;
  /** Section key, exposed as data-section for styling hooks. */
  name: string;
  heading: string;
  intro?: string | undefined;
  /** 'inverse' renders the section in the opposite colour mode (a dark band on a light site). */
  tone?: 'inverse';
  className?: string;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-section={name}
      data-tone={tone}
      className={cn('c-section', className)}
    >
      <div className="c-container">
        <div className="c-section-head">
          <h2 id={headingId} className="c-section-heading">
            {heading}
          </h2>
          {intro && <p className="c-section-intro">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
