'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

type Props = { locale: string; className?: string };

/** Simple form that navigates to /{locale}/warranty/{number} on submit. */
export function WarrantySearchForm({ locale, className }: Props) {
  const [number, setNumber] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = number.trim();
    if (trimmed) {
      router.push(`/${locale}/warranty/${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor="warranty-number" className="sr-only">
        Warranty number
      </label>
      <input
        id="warranty-number"
        className="c-input w-full text-center text-lg"
        type="text"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="PPF-2026-00001"
        autoComplete="off"
        spellCheck={false}
        dir="ltr"
        required
      />
      <button type="submit" className="c-button mt-4 w-full" data-variant="primary">
        Look up
      </button>
    </form>
  );
}
