"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The page's preloader.
 *
 * Covers everything from the first paint until the hero's scene reports that
 * frames are reaching the screen, then lifts. The line creeps to 93% on its
 * own and only completes when the scene is ready, so it is a real signal
 * about a real wait rather than a decoration that always takes the same
 * second.
 *
 * It can never trap the reader: a hero with no WebGL reports ready at once,
 * a scene that never reports is given twelve seconds, and without scripting
 * the stylesheet hides it outright.
 */

declare global {
  interface Window {
    __lpHeroReady?: boolean;
  }
}

const GIVE_UP_MS = 12000;

export function Preloader() {
  const [phase, setPhase] = useState<"loading" | "done" | "gone">("loading");
  const lineRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-loading");

    let ready = window.__lpHeroReady === true;
    let finished = false;
    let value = 0;
    let frame = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      root.classList.remove("is-loading");
      setPhase("done");
      window.dispatchEvent(new Event("lp:preloader-done"));
      window.setTimeout(() => setPhase("gone"), 1000);
    };

    const onReady = () => {
      ready = true;
    };
    window.addEventListener("lp:hero-ready", onReady);
    const giveUp = window.setTimeout(onReady, GIVE_UP_MS);

    const tick = () => {
      const target = ready ? 100 : 93;
      value += (target - value) * (ready ? 0.14 : 0.06);
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${value / 100})`;
      if (numberRef.current) numberRef.current.textContent = String(Math.round(value));
      if (ready && value > 99.4) {
        finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(giveUp);
      window.removeEventListener("lp:hero-ready", onReady);
      root.classList.remove("is-loading");
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`preloader${phase === "done" ? " preloader--done" : ""}`} aria-hidden="true">
      <p className="preloader-mark">Velvé</p>
      <div className="preloader-track">
        <div className="preloader-line" ref={lineRef} />
      </div>
      <p className="preloader-text">
        <span ref={numberRef}>0</span>%
      </p>
    </div>
  );
}
