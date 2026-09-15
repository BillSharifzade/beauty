/**
 * The easing curves the product timeline is allowed to use.
 *
 * Named rather than inlined so the part config stays declarative: a designer
 * changes `ease: "signature"` to `ease: "expo.out"` without touching the rig.
 * The names follow GSAP's so the vocabulary matches the rest of the spec, but
 * the functions are local — the scroll rig evaluates them on every frame for
 * ten parts, and going through gsap.parseEase there would buy nothing.
 */

export type EaseName =
  | "linear"
  | "power2.out"
  | "power2.inOut"
  | "power3.out"
  | "power4.out"
  | "expo.out"
  | "signature";

export type EaseFn = (t: number) => number;

/** Newton-Raphson with a bisection safety net — the same solver a browser uses
 *  for `cubic-bezier()`, so "signature" really is cubic-bezier(0.65, 0, 0.35, 1). */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): EaseFn {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i += 1) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-5) return sampleY(t);
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= dx / slope;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 24; i += 1) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-5) break;
      if (v > x) hi = t;
      else lo = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

export const EASES: Readonly<Record<EaseName, EaseFn>> = {
  linear: (t) => t,
  "power2.out": (t) => 1 - (1 - t) * (1 - t),
  "power2.inOut": (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) * (-2 * t + 2)) / 2),
  "power3.out": (t) => 1 - (1 - t) ** 3,
  "power4.out": (t) => 1 - (1 - t) ** 4,
  "expo.out": (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  signature: cubicBezier(0.65, 0, 0.35, 1),
};

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Hermite smoothstep — used for the copy fades, where a linear ramp reads as
 *  a dimmer switch rather than as something arriving. */
export const smoothstep = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** Progress inside a window, clamped and eased. */
export function windowT(p: number, from: number, to: number, ease: EaseFn): number {
  if (to <= from) return p >= to ? 1 : 0;
  return ease(clamp01((p - from) / (to - from)));
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent approach factor for a per-frame lerp. */
export const damp = (factor: number, delta: number) => 1 - (1 - factor) ** (delta * 60);
