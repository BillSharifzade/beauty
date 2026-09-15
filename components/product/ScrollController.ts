"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * One number, produced once per frame.
 *
 * The whole segment is driven by a single value: how far through the pinned
 * range the reader is, 0 to 1. Ten parts, the camera, four lights, the ground
 * shadow and five pieces of copy all read it, and none of them owns a scroll
 * listener of its own. That is the difference between a sequence that holds 60
 * frames a second and one that does not.
 *
 * The store is a plain mutable object rather than React state on purpose:
 * a value that changes on every frame must never cause a render.
 */
export interface ProgressStore {
  /** Written by the scrubbed timeline, read by the render loop. */
  raw: number;
  /** The value the loop last painted with. Read by anything that needs a
   *  starting point before the first frame arrives. */
  last: number;
  /** Register the one listener that paints DOM in step with the scene, so the
   *  copy moves on the same frame as the product rather than on a second,
   *  slightly different clock. */
  subscribe: (listener: (progress: number) => void) => () => void;
  /** Called by the render loop, once per frame. */
  emit: (progress: number) => void;
}

export function createProgressStore(initial = 0): ProgressStore {
  let listener: ((progress: number) => void) | null = null;
  const store: ProgressStore = {
    raw: initial,
    last: initial,
    subscribe: (fn) => {
      listener = fn;
      return () => {
        if (listener === fn) listener = null;
      };
    },
    emit: (progress) => {
      store.last = progress;
      listener?.(progress);
    },
  };
  return store;
}

let registered = false;

function register(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export interface ScrollTimelineOptions {
  /** The section. Its top meeting the top of the viewport starts the sequence. */
  trigger: HTMLElement;
  /** The element that stays still while the range is scrolled through. */
  pin: HTMLElement;
  store: ProgressStore;
  /** Length of the pinned range in viewport heights. */
  length: number;
  /** ScrollTrigger scrub, in seconds of catch-up. */
  scrub: number;
}

/**
 * Builds the one timeline and hands back its disposer.
 *
 * The timeline animates a single scalar. Everything else in the section is a
 * pure function of that scalar evaluated in the render loop, which is why
 * scrubbing backwards costs nothing and why there is no state to get out of
 * sync when the reader flicks up the page.
 *
 * The end is computed in pixels from the viewport rather than written as a
 * percentage, because a percentage in a relative end resolves against
 * different boxes depending on the version, and "six screens" is what was
 * actually meant.
 */
export function attachScrollTimeline(options: ScrollTimelineOptions): () => void {
  register();

  const { trigger, pin, store, length, scrub } = options;
  const state = { p: store.raw };

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger,
      pin,
      pinSpacing: true,
      anticipatePin: 1,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * length)}`,
      scrub,
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        state.p = self.progress;
        store.raw = self.progress;
      },
    },
  });

  timeline.to(state, {
    p: 1,
    ease: "none",
    duration: 1,
    onUpdate: () => {
      store.raw = state.p;
    },
  });

  // The section is set in a web font, and a font arriving after layout changes
  // nothing here but does change the height of everything above it.
  let cancelled = false;
  void document.fonts.ready.then(() => {
    if (!cancelled) ScrollTrigger.refresh();
    return null;
  });

  return () => {
    cancelled = true;
    timeline.scrollTrigger?.kill();
    timeline.kill();
  };
}
