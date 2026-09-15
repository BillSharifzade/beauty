"use client";

import { useCallback, useEffect, useRef } from "react";
import { WINDOWS } from "./config/products";
import type { ProductId } from "./config/types";
import { clamp01, smoothstep } from "./easing";
import type { ProgressStore } from "./ScrollController";

/**
 * The words.
 *
 * An opening statement, one caption for each product while it assembles, and
 * a close. They are painted straight onto the DOM from the render loop
 * rather than held in React state: the copy has to move on exactly the same
 * frame as the products, and a state update per frame would cost more than
 * the whole scene.
 *
 * The products stay the subject throughout. Captions sit low and quiet; the
 * close takes a band along the bottom, which is why the camera looks a
 * little below the lineup at the very end.
 */

interface Stage {
  id: ProductId;
  index: string;
  word: string;
  gloss: string;
}

const STAGES: readonly Stage[] = [
  { id: "cream", index: "01", word: "Cream", gloss: "Крем. Сорок восемь часов увлажнения и ни грамма лишнего." },
  { id: "tint", index: "02", word: "Tint", gloss: "Тинт. Тонкий слой цвета, который держится весь день." },
  { id: "shampoo", index: "03", word: "Shampoo", gloss: "Шампунь. Мягкое очищение при pH 5,5." },
  { id: "mascara", index: "04", word: "Mascara", gloss: "Тушь. Объём и разделение без единого комка." },
  { id: "pencil", index: "05", word: "Pencil", gloss: "Карандаш. Одна линия — одно движение." },
];

function place(element: HTMLElement | null, v: number, lift: number, blur: number): void {
  if (!element) return;
  element.style.opacity = String(v);
  element.style.transform = `translate3d(0, ${(1 - v) * lift}px, 0)`;
  // Blur is the expensive part, so it is only paid for while a block is
  // actually arriving or leaving.
  element.style.filter = v > 0.985 || v < 0.015 ? "none" : `blur(${(1 - v) * blur}px)`;
  element.style.visibility = v < 0.005 ? "hidden" : "visible";
}

export function Copy({
  store,
  staticProgress,
}: {
  store: ProgressStore;
  /** Set when nothing is driving the loop: before mount, reduced motion, or
   *  no WebGL. */
  staticProgress?: number;
}) {
  const introRef = useRef<HTMLDivElement | null>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const closeRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLParagraphElement | null>(null);

  const paint = useCallback((p: number) => {
    // The opening statement leaves the moment the first product starts.
    place(introRef.current, 1 - smoothstep(clamp01((p - 0.004) / 0.05)), -18, 6);

    for (let i = 0; i < STAGES.length; i += 1) {
      const stage = STAGES[i];
      const element = stageRefs.current[i];
      const window = stage ? WINDOWS[stage.id] : undefined;
      if (!stage || !element || !window) continue;
      const [a, b] = window;
      const edge = (b - a) * 0.16;
      const v = smoothstep(clamp01((p - a) / edge)) * (1 - smoothstep(clamp01((p - (b - edge)) / edge)));
      place(element, v, 20, 8);
    }

    const hero = smoothstep(clamp01((p - 0.9) / 0.08));
    const close = closeRef.current;
    if (close) {
      place(close, hero, 26, 9);
      // A button nobody can see must not be a button anybody can tab into.
      close.style.pointerEvents = hero > 0.6 ? "auto" : "none";
      close.setAttribute("aria-hidden", hero > 0.6 ? "false" : "true");
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
      <div className="pr-intro" ref={introRef}>
        <p className="pr-eyebrow">Velvé · Коллекция 2026</p>
        <h1 className="pr-title" id="hero-title">
          Красота, собранная <span className="pr-title-accent">точно</span>
        </h1>
        <p className="pr-intro-lede">Пять формул. Тридцать две детали. Ни одной случайной.</p>
      </div>

      <div className="pr-stages" aria-hidden="true">
        {STAGES.map((stage, i) => (
          <div
            key={stage.id}
            className="pr-stage"
            ref={(element) => {
              stageRefs.current[i] = element;
            }}
          >
            <span className="pr-stage-index">
              {stage.index} <span className="pr-stage-of">/ 05</span>
            </span>
            <span className="pr-stage-word">{stage.word}</span>
            <span className="pr-stage-gloss">{stage.gloss}</span>
          </div>
        ))}
      </div>

      <div className="pr-close" ref={closeRef}>
        <div className="pr-close-copy">
          <p className="pr-eyebrow">Коллекция</p>
          <h2 className="pr-close-title">
            Пять формул. <span className="pr-title-accent">Одна точность.</span>
          </h2>
        </div>
        <div className="pr-close-side">
          <p className="pr-close-lede">
            Каждая деталь на своём месте, и у каждой есть причина там находиться. Так мы делаем
            косметику.
          </p>
          <div className="pr-close-cta">
            <a href="#collection" className="lp-btn lp-btn--primary lp-btn--lg">
              Смотреть коллекцию
            </a>
            <a href="#formula" className="lp-btn lp-btn--ghost lp-btn--lg">
              О формуле
            </a>
          </div>
        </div>
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
