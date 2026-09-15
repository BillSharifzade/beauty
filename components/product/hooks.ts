"use client";

import { useEffect, useState } from "react";

/**
 * The three questions the section has to answer before it draws anything.
 *
 * All three read the browser during the first render rather than in an effect.
 * That is safe here and only here: the whole segment is loaded with ssr:false,
 * so there is no server markup to disagree with, and answering late would mean
 * building the canvas at the wrong pixel ratio and then rebuilding it.
 */

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Honoured literally: no pin, no assembly, the finished product faded in. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Phones and tablets. Coarse pointer is in the test because a 1024-wide tablet
 * has a desktop's width and a phone's GPU, and the things this switches — pixel
 * ratio, shadow resolution, lathe segments, how far the parts scatter — are all
 * decided by the second fact rather than the first.
 */
export function useIsCompact(): boolean {
  return useMediaQuery("(max-width: 860px), (pointer: coarse)");
}

/**
 * Whether there is a WebGL context to be had.
 *
 * Asked once, by actually trying: the feature-detect libraries all end up here
 * anyway, and a browser that reports the constructor but refuses the context
 * is exactly the case worth catching. The context is released immediately so
 * the probe does not eat one of the browser's handful of live contexts.
 */
export function useWebGLSupport(): boolean {
  const [supported] = useState(() => {
    if (typeof document === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      const context =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");
      if (!context) return false;
      if (context instanceof WebGLRenderingContext || context instanceof WebGL2RenderingContext) {
        context.getExtension("WEBGL_lose_context")?.loseContext();
      }
      return true;
    } catch {
      return false;
    }
  });

  return supported;
}
