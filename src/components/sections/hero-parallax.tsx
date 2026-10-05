'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Feeds pointer position (--px, --py: -1..1) and scroll progress (--sy: 0..1) to the hero
 * stage as CSS variables; the layers turn them into parallax in globals.css (.c-hero-layer).
 * Entrance and idle motion are pure CSS, so the hero paints fully before this hydrates.
 */
export function HeroParallax({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

    const target = { px: 0, py: 0, sy: 0 };
    const current = { px: 0, py: 0, sy: 0 };
    let frame = 0;

    const tick = () => {
      let moving = false;
      for (const key of ['px', 'py', 'sy'] as const) {
        const delta = target[key] - current[key];
        current[key] = Math.abs(delta) < 0.001 ? target[key] : current[key] + delta * 0.08;
        moving ||= current[key] !== target[key];
        el.style.setProperty(`--${key}`, current[key].toFixed(4));
      }
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const run = () => {
      frame ||= requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = el.getBoundingClientRect();
      target.px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      target.py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      run();
    };
    const onPointerLeave = () => {
      target.px = 0;
      target.py = 0;
      run();
    };
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      target.sy = Math.min(1, Math.max(0, -rect.top / rect.height));
      run();
    };

    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
