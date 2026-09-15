"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SHAMPOO } from "./config/shampoo";
import { HeroText } from "./HeroText";
import { useIsCompact, useReducedMotion, useWebGLSupport } from "./hooks";
import { ProductScene } from "./ProductScene";
import { attachScrollTimeline, createProgressStore } from "./ScrollController";
import { asset } from "@/lib/asset";

/**
 * The pinned segment.
 *
 * Six screens of scrolling with one screen of content held still inside them,
 * during which a shampoo bottle assembles itself out of ten parts. It sits
 * between the hero and the shelf, where the page has just made a claim and has
 * not yet started proving it, and its argument is the same as the page's: this
 * was put together deliberately, and every piece is where it is for a reason.
 *
 * Three ways to render it, and the section picks one before it draws anything:
 *
 * - Normally: pinned, scrubbed, assembled by the reader.
 * - prefers-reduced-motion: no pin, no assembly, the finished product faded in
 *   with all the copy visible at once. The reader loses nothing but the show.
 * - No WebGL: a still of the finished product and the same copy. No canvas is
 *   created, so nothing below it can break either.
 */

/** Length of the pinned range, in viewport heights. */
const SCROLL_LENGTH = 6;

/** ScrollTrigger's catch-up, in seconds. Together with the rig's own lerp this
 *  is the whole feel of the thing: enough to take the steps out of a mouse
 *  wheel, not so much that the product lags behind the hand. */
const SCRUB = 0.8;

/** Height of the page's sticky bar, plus a little, in CSS pixels. */
const NAV_BAND_PX = 76;

export function ProductScrollSection() {
  const reduced = useReducedMotion();
  const compact = useIsCompact();
  const webgl = useWebGLSupport();

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  const animated = webgl && !reduced;
  const store = useMemo(() => createProgressStore(animated ? 0 : 1), [animated]);

  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // The section carries an anchor and arrives as its own chunk, after NavSpy
  // has already gone looking for the page's sections. So it announces itself.
  useEffect(() => {
    window.dispatchEvent(new Event("hb:sections-changed"));
  }, []);

  /* The page's bar is glass, and glass over a black studio in the light theme
   * is a grey stripe across the top of the shot. While this section is the
   * thing under the bar, the bar switches to its dark treatment.
   *
   * An observer over a band the height of the bar rather than a scroll
   * listener: the section's own box spans the whole pinned range in the
   * document, so "the section is under the bar" is exactly "the section's box
   * crosses the top strip of the viewport", in both themes and in the static
   * layouts too. */
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
    return attachScrollTimeline({
      trigger: section,
      pin,
      store,
      length: SCROLL_LENGTH,
      scrub: SCRUB,
    });
  }, [animated, store]);

  /* The loading line. It creeps to 93% on its own and only completes when
   * frames are actually reaching the screen, so it is a real signal about a
   * real wait rather than a decoration that always takes the same second. */
  useEffect(() => {
    if (!webgl) return undefined;
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
  }, [ready, webgl]);

  return (
    <section
      className={`pr${animated ? "" : " pr--static"}`}
      id="product"
      ref={sectionRef}
      aria-labelledby="product-title"
    >
      <div className="pr-pin" ref={pinRef}>
        <h2 className="visually-hidden" id="product-title">
          Флакон Hayat Beauty, собранный из деталей
        </h2>

        <div className={`pr-canvas${revealed || !webgl ? " pr-canvas--in" : ""}`}>
          {webgl ? (
            <ProductScene
              config={SHAMPOO}
              store={store}
              compact={compact}
              still={reduced}
              onReady={onReady}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="pr-poster"
              src={asset("/brand/product-hero.webp")}
              width={1200}
              height={1200}
              alt="Флакон шампуня Hayat Beauty: прозрачный корпус, перламутровая формула, розовая крышка и дозатор"
              decoding="async"
              loading="lazy"
            />
          )}
        </div>

        <div className="pr-haze" aria-hidden="true" />

        <HeroText store={store} staticProgress={animated ? undefined : 1} />

        {webgl && (
          <div className={`pr-loader${revealed ? " pr-loader--gone" : ""}`} aria-hidden="true">
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
