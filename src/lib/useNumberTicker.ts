import { useEffect, useState } from 'react';

/**
 * Anima um número de 0 até `value` durante `duration` ms.
 * Respeita prefers-reduced-motion — pula a animação se o usuário pediu.
 *
 * @example
 * const display = useNumberTicker(stats.totalClientes, 600);
 */
export function useNumberTicker(value: number, duration = 600): number {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDisplay(value);
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    if (value === 0) {
      setDisplay(0);
      return;
    }

    const start = performance.now();
    const startValue = display;
    const delta = value - startValue;
    let frame = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(startValue + delta * eased));

      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setDisplay(value);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return display;
}
