"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SCENE } from "./config/products";
import { Copy } from "./Copy";
import { useIsCompact, useMounted, useReducedMotion, useWebGLSupport } from "./hooks";
import type { StillView } from "./ProductScene";
import { attachScrollTimeline, createProgressStore } from "./ScrollController";
import { asset } from "@/lib/asset";
import { useResolvedTheme } from "@/lib/theme";

/**
 * The hero: a pinned segment in which the collection assembles itself.
 *
 * Nine screens of scrolling with one screen of content held still inside
 * them. The reader lands on a cloud of thirty-two parts; five products put
 * themselves together one after another as the page is scrolled; the camera
 * pulls back and they stand as a family. The argument is the brand's: this
 * was put together deliberately, and every piece is where it is for a reason.
 *
 * Three.js, R3F, drei and GSAP together are far more JavaScript than the rest
 * of the page, and none of it can run on the server, so the scene arrives as
 * its own chunk after the page is readable. The section's own markup — the
 * heading, the captions, the close — is server-rendered like the rest of the
 * page, which is why the hooks above answer after mount rather than during
 * render. The page's preloader waits on this section: it announces itself
 * on `lp:hero-ready` once frames are actually reaching the screen.
 *
 * Four ways to render it, and the section picks one before it draws anything:
 *
 * - Normally: pinned, scrubbed, assembled by the reader.
 * - prefers-reduced-motion: no pin, no assembly, the finished collection faded
 *   in with the copy visible at once. The reader loses nothing but the show.
 * - No WebGL: a still of the finished collection and the same copy. No canvas
 *   is created, so nothing below it can break either.
 * - `?still=<product|lineup>`: one authored frame with the page chrome hidden,
 *   which is how the product stills and the poster are rendered.
 */

const ProductScene = dynamic(() => import("./ProductScene").then((module) => module.ProductScene), {
  ssr: false,
});

/** Length of the pinned range, in viewport heights. */
const SCROLL_LENGTH = 9;

/** ScrollTrigger's catch-up, in seconds. Together with the rig's own lerp this
 *  is the whole feel of the thing: enough to take the steps out of a mouse
 *  wheel, not so much that the products lag behind the hand. */
const SCRUB = 0.8;

const STILL_VIEWS = new Set<string>(["cream", "tint", "shampoo", "mascara", "pencil", "lineup"]);

export function ProductScrollSection() {
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const compact = useIsCompact();
  const webgl = useWebGLSupport();
  const dark = useResolvedTheme() === "dark";

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  const [stillView, setStillView] = useState<StillView | null>(null);
  const [fixed, setFixed] = useState<number | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const still = params.get("still");
    if (still && STILL_VIEWS.has(still)) {
      setStillView(still as StillView);
      document.documentElement.setAttribute("data-still", params.get("copy") === "1" ? "copy" : "");
    }
    // ?p=0.42 holds the sequence at one progress value: for tuning the
    // choreography and for screenshots that cannot wait on a scrub.
    const p = Number(params.get("p"));
    if (params.has("p") && Number.isFinite(p)) setFixed(Math.min(1, Math.max(0, p)));
  }, []);

  const animated = mounted && webgl === true && !reduced && stillView === null && fixed === null;
  const store = useMemo(() => createProgressStore(animated ? 0 : 1), [animated]);

  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => {
    setReady(true);
    window.__lpHeroReady = true;
    window.dispatchEvent(new Event("lp:hero-ready"));
  }, []);

  // With no WebGL there is nothing to wait for: the poster is the hero.
  useEffect(() => {
    if (webgl === false) onReady();
  }, [webgl, onReady]);

  /* The render loop only runs while the section is on screen. Nine screens
   * of pin spacing keep the section's box in the document long after the
   * pinned frame has scrolled away, so the observer watches the pinned frame
   * itself. */
  const [active, setActive] = useState(true);
  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) setActive(entry.isIntersecting);
    });
    observer.observe(pin);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animated) return undefined;
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return undefined;
    return attachScrollTimeline({ trigger: section, pin, store, length: SCROLL_LENGTH, scrub: SCRUB });
  }, [animated, store]);

  const showScene = mounted && webgl === true;
  const showPoster = mounted && webgl === false;
  const posterAlt =
    "Коллекция Velvé: крем, тинт, шампунь, тушь и карандаш стоят в ряд в тёмной студии";

  return (
    <section
      className={`pr${animated ? "" : " pr--static"}`}
      id="hero"
      ref={sectionRef}
      aria-labelledby="hero-title"
    >
      <div className="pr-pin" ref={pinRef}>
        <div className={`pr-canvas${ready || showPoster ? " pr-canvas--in" : ""}`}>
          {showScene && (
            <ProductScene
              config={SCENE}
              store={store}
              compact={compact}
              still={reduced}
              stillView={stillView}
              fixed={fixed}
              active={active}
              dark={dark}
              onReady={onReady}
            />
          )}
          {showPoster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="pr-poster"
              src={asset("/brand/poster.webp")}
              width={1600}
              height={1000}
              alt={posterAlt}
              decoding="async"
            />
          )}
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pr-poster" src={asset("/brand/poster.webp")} width={1600} height={1000} alt={posterAlt} />
          </noscript>
        </div>

        <div className="pr-haze" aria-hidden="true" />

        <Copy store={store} staticProgress={!mounted ? 0 : animated ? undefined : (fixed ?? 1)} />

      </div>
    </section>
  );
}
