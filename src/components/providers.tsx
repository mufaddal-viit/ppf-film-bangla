'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { captureAttribution } from '@/lib/tracking/attribution';

/** Client-side providers: TanStack Query for mutations, plus first-visit attribution capture. */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { mutations: { retry: false } } }));
  useEffect(captureAttribution, []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
