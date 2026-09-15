"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SCENE } from "./config/products";
import { Copy } from "./Copy";
import { useIsCompact, useMounted, useReducedMotion, useWebGLSupport } from "./hooks";
import type { StillView } from "./ProductScene";
import { attachScrollTimeline, createProgressStore } from "./ScrollController";
import { asset } from "@/lib/asset";

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
 * render.
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

/** Height of the page's sticky bar, plus a little, in CSS pixels. */
const NAV_BAND_PX = 76;

const STILL_VIEWS = new Set<string>(["cream", "tint", "shampoo", "mascara", "pencil", "lineup"]);

export function ProductScrollSection() {
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const compact = useIsCompact();
  const webgl = useWebGLSupport();

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

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
  const [revealed, setRevealed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

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

  /* The page's bar is glass, and glass over a black studio in the light theme
   * is a grey stripe across the top of the shot. While this section is the
   * thing under the bar, the bar switches to its dark treatment. An observer
   * over a band the height of the bar rather than a scroll listener. */
  useEffect(() => {
    const section = sectionRef.current;
    const nav = document.querySelector(".lp-nav");
    if (!section || !nav) return undefined;

    let observer: IntersectionObserver | null = null;

    const watch = () => {
      observer?.disconnect();
      const below = Math.max(0, window.innerHeight - NAV_BAND_PX);
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) nav.toggleAttribute("data-over-dark", entry.isIntersecting);
        },
        { rootMargin: `0px 0px -${below}px 0px` },
      );
      observer.observe(section);
    };

    watch();
    window.addEventListener("resize", watch);
    return () => {
      window.removeEventListener("resize", watch);
      observer?.disconnect();
      nav.removeAttribute("data-over-dark");
    };
  }, []);

  useEffect(() => {
    if (!animated) return undefined;
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return undefined;
    return attachScrollTimeline({ trigger: section, pin, store, length: SCROLL_LENGTH, scrub: SCRUB });
  }, [animated, store]);

  /* The loading line. It creeps to 93% on its own and only completes when
   * frames are actually reaching the screen, so it is a real signal about a
   * real wait rather than a decoration that always takes the same second. */
  useEffect(() => {
    if (!mounted || webgl === false) return undefined;
    let value = 0;
    let frame = 0;
    const tick = () => {
      const target = ready ? 100 : 93;
      value += (target - value) * 0.07;
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${value / 100})`;
      if (numberRef.current) numberRef.current.textContent = String(Math.round(value));
      if (ready && value > 99.4) {
        setRevealed(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ready, mounted, webgl]);

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
        <div className={`pr-canvas${revealed || showPoster ? " pr-canvas--in" : ""}`}>
          {showScene && (
            <ProductScene
              config={SCENE}
              store={store}
              compact={compact}
              still={reduced}
              stillView={stillView}
              fixed={fixed}
              active={active}
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

        {webgl !== false && (
          <div className={`pr-loader${revealed ? " pr-loader--gone" : ""}`} aria-hidden="true">
            <p className="pr-loader-mark">Velvé</p>
            <div className="pr-loader-track">
              <div className="pr-loader-line" ref={lineRef} />
            </div>
            <p className="pr-loader-text">
              <span ref={numberRef}>0</span>%
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
