"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useIsCompact, useMounted, useReducedMotion, useWebGLSupport } from "../product/hooks";
import { useResolvedTheme } from "@/lib/theme";

/**
 * The one canvas behind every product card.
 *
 * Five live products on a page would be five WebGL contexts the naive way,
 * which is five of everything and a browser that starts dropping them. Here
 * there is one fixed, transparent canvas over the page and one View per
 * card: each card's scene is drawn into the card's own rectangle, and cards
 * that are off screen are not drawn at all.
 *
 * It arrives after the hero has reported ready, so the two never compete for
 * the GPU while the page is still loading, and only where WebGL exists; the
 * cards stand on their own without it.
 */
const CollectionCanvasInner = dynamic(
  () => import("./CollectionCanvasInner").then((module) => module.CollectionCanvasInner),
  { ssr: false },
);

export function CollectionCanvas() {
  const mounted = useMounted();
  const compact = useIsCompact();
  const reduced = useReducedMotion();
  const webgl = useWebGLSupport();
  const dark = useResolvedTheme() === "dark";
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    if (window.__lpHeroReady) setHeroReady(true);
    const onReady = () => setHeroReady(true);
    window.addEventListener("lp:hero-ready", onReady);
    // A hero that never reports must not keep the collection dark forever.
    const fallback = window.setTimeout(onReady, 15000);
    return () => {
      window.removeEventListener("lp:hero-ready", onReady);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!mounted || webgl !== true || !heroReady) return null;
  return <CollectionCanvasInner compact={compact} reduced={reduced} dark={dark} />;
}
