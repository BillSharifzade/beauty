"use client";

import { useEffect, useState } from "react";

/**
 * The three questions the section has to answer before it draws anything.
 *
 * All three are answered after mount, never during render: the section's
 * markup is server-rendered so the page has its heading and its copy before
 * any JavaScript arrives, and the server has no window to ask. Until the
 * answer comes back the section shows its loader, which it would be showing
 * anyway while the scene's chunk is on the wire.
 */

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Honoured literally: no pin, no assembly, the finished collection faded in. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Phones and tablets. Coarse pointer is in the test because a 1024-wide tablet
 * has a desktop's width and a phone's GPU, and the things this switches — pixel
 * ratio, shadow resolution, lathe segments, how the products are arranged —
 * are all decided by the second fact rather than the first.
 */
export function useIsCompact(): boolean {
  return useMediaQuery("(max-width: 860px), (pointer: coarse)");
}

/**
 * Whether there is a WebGL context to be had, asked once by actually trying:
 * a browser that reports the constructor but refuses the context is exactly
 * the case worth catching. The context is released immediately so the probe
 * does not eat one of the browser's handful of live contexts. `null` until
 * the question has been asked.
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");
      if (!context) {
        setSupported(false);
        return;
      }
      if (context instanceof WebGLRenderingContext || context instanceof WebGL2RenderingContext) {
        context.getExtension("WEBGL_lose_context")?.loseContext();
      }
      setSupported(true);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}

/** True once the component is on the client, false in the server render and
 *  during hydration. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
