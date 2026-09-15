"use client";

import { useEffect, useRef } from "react";

/**
 * A number that counts up to its value the first time it comes into view.
 *
 * The final value is server-rendered, so the page reads correctly before any
 * script runs and under reduced motion; the count is a flourish on top. The
 * digits are written straight into the span from a frame loop, never through
 * React state.
 */
export function Counter({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (v: number) =>
    v.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const duration = 1400;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // expo.out: fast at first, then settling on the number.
        const eased = t >= 1 ? 1 : 1 - 2 ** (-10 * t);
        element.textContent = format(value * eased);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(element);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
    // format is stable for a given value/decimals pair.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
