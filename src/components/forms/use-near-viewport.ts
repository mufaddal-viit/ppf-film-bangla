'use client';

import { useEffect, useState, type RefObject } from 'react';

/** True once the element comes within `margin` of the viewport; stays true afterwards. */
export function useNearViewport(ref: RefObject<HTMLElement | null>, margin = '400px'): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, near, margin]);
  return near;
}
