"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { clamp01, smoothstep } from "./easing";
import type { ProgressStore } from "./ScrollController";

/**
 * The words.
 *
 * Four of them mark the stages, one for each thing the sequence is showing at
 * that moment, and the fifth is the close. They are painted straight onto the
 * DOM from the render loop rather than held in React state: the copy has to
 * move on exactly the same frame as the product, and a state update per frame
 * would cost more than the whole scene.
 *
 * The product stays the subject throughout. Stage captions sit low and quiet;
 * the closing block takes the left half of a wide screen, which is why the
 * camera looks slightly left of the bottle at the very end.
 */

interface Stage {
  word: string;
  gloss: string;
  at: number;
  span: number;
}

const STAGES: readonly Stage[] = [
  { word: "FORM", gloss: "корпус и его объём", at: 0.2, span: 0.11 },
  { word: "FORMULA", gloss: "густая, перламутровая", at: 0.4, span: 0.11 },
  { word: "PRECISION", gloss: "этикетка ложится по месту", at: 0.6, span: 0.11 },
  { word: "DESIGNED AS ONE", gloss: "дозатор садится в горловину", at: 0.8, span: 0.1 },
];

export function HeroText({
  store,
  staticProgress,
}: {
  store: ProgressStore;
  /** Set when nothing is driving the loop: reduced motion, or no WebGL. */
  staticProgress?: number;
}) {
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLParagraphElement | null>(null);

  const paint = useCallback((p: number) => {
    for (let i = 0; i < STAGES.length; i += 1) {
      const stage = STAGES[i];
      const element = stageRefs.current[i];
      if (!stage || !element) continue;
      const v = smoothstep(clamp01(1 - Math.abs(p - stage.at) / stage.span));
      element.style.opacity = String(v);
      element.style.transform = `translate3d(0, ${(1 - v) * 20}px, 0)`;
      // Blur is the expensive part, so it is only paid for while a caption is
      // actually arriving or leaving.
      element.style.filter = v > 0.985 || v < 0.015 ? "none" : `blur(${(1 - v) * 8}px)`;
      element.style.visibility = v < 0.005 ? "hidden" : "visible";
    }

    const hero = smoothstep(clamp01((p - 0.9) / 0.08));
    const heroEl = heroRef.current;
    if (heroEl) {
      heroEl.style.opacity = String(hero);
      heroEl.style.transform = `translate3d(0, ${(1 - hero) * 26}px, 0)`;
      heroEl.style.filter = hero > 0.985 || hero < 0.015 ? "none" : `blur(${(1 - hero) * 9}px)`;
      heroEl.style.visibility = hero < 0.005 ? "hidden" : "visible";
      // A button nobody can see must not be a button anybody can tab into.
      heroEl.style.pointerEvents = hero > 0.6 ? "auto" : "none";
      heroEl.setAttribute("aria-hidden", hero > 0.6 ? "false" : "true");
    }

    const bar = barRef.current;
    if (bar) bar.style.transform = `scaleX(${p})`;

    // The nudge to scroll has done its job the instant scrolling starts.
    const hint = hintRef.current;
    if (hint) hint.style.opacity = String(1 - smoothstep(clamp01(p / 0.03)));
  }, []);

  useEffect(() => {
    if (staticProgress !== undefined) {
      paint(staticProgress);
      return undefined;
    }
    paint(store.last);
    return store.subscribe(paint);
  }, [paint, store, staticProgress]);

  return (
    <>
      <div className="pr-stages" aria-hidden="true">
        {STAGES.map((stage, i) => (
          <div
            key={stage.word}
            className="pr-stage"
            ref={(element) => {
              stageRefs.current[i] = element;
            }}
          >
            <span className="pr-stage-word">{stage.word}</span>
            <span className="pr-stage-gloss">{stage.gloss}</span>
          </div>
        ))}
      </div>

      <div className="pr-hero" ref={heroRef}>
        <p className="pr-eyebrow">Hayat Beauty</p>
        <h2 className="pr-hero-title">
          Чистая формула. <span className="pr-hero-accent">Собрано точно.</span>
        </h2>
        <p className="pr-hero-lede">
          Так же собран и ассистент: каждая деталь на своём месте, и у каждой есть причина там
          находиться.
        </p>
        <Link href="/app" className="lp-btn lp-btn--primary lp-btn--lg">
          Открыть ассистента
        </Link>
      </div>

      <div className="pr-bar" aria-hidden="true">
        <div className="pr-bar-fill" ref={barRef} />
      </div>

      {staticProgress === undefined && (
        <p className="pr-hint" ref={hintRef} aria-hidden="true">
          Листайте
        </p>
      )}
    </>
  );
}
