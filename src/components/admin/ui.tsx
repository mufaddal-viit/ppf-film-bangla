import type { ReactNode } from 'react';
import { LEAD_STATUS_LABELS, type LeadStatus } from '@/lib/admin/constants';
import { initials } from '@/lib/admin/format';

/** Title row at the top of every admin page. */
export function PageHead({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <header className="c-admin-head">
      <div>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
      {children && <div className="c-admin-head-actions">{children}</div>}
    </header>
  );
}

type PanelProps = {
  title?: string;
  /** Shown at the end of the title row, for a "see all" link or a small figure. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <section className={className ? `c-admin-panel ${className}` : 'c-admin-panel'}>
      {(title || action) && (
        <header className="c-admin-panel-head">
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Initials in a soft circle, standing in for a photo. */
export function Avatar({ name, size }: { name: string; size?: 'lg' }) {
  return (
    <span className="c-admin-avatar" data-size={size} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

/** A label wrapped around its control, so no id wiring is needed. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="c-admin-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className="c-admin-status" data-status={status}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

/** A small coloured label for states that are not lead statuses. */
export function Pill({ tone, children }: { tone: 'success' | 'warning' | 'muted' | 'primary'; children: ReactNode }) {
  return (
    <span className="c-admin-status" data-tone={tone}>
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="c-admin-empty">{children}</p>;
}
