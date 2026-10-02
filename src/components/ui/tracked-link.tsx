'use client';

import type { ComponentProps } from 'react';
import { track, type TrackEvent } from '@/lib/tracking/track';

/** External or tel: link that records an analytics event (after consent) when clicked. */
export function TrackedLink({ event, onClick, ...props }: ComponentProps<'a'> & { event: TrackEvent }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    />
  );
}
