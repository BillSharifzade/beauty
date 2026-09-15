"use client";

import { useEffect } from "react";

/**
 * Marks the nav link of the section that is on screen.
 *
 * An IntersectionObserver over the anchored sections, not a scroll listener:
 * the browser tells us when a section crosses the middle band of the viewport
 * and nothing runs on the other frames. The link gets aria-current, and the
 * stylesheet does the rest.
 *
 * One of the sections is loaded lazily and is not in the document when this
 * first runs, so the observer is rebuilt when a section says it has arrived.
 */
export function NavSpy({ ids }: { ids: string[] }) {
  useEffect(() => {
    let io: IntersectionObserver | null = null;

    const observe = () => {
      io?.disconnect();

      const sections = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      if (sections.length === 0) return;

      const links = new Map<string, HTMLAnchorElement>();
      for (const id of ids) {
        const a = document.querySelector<HTMLAnchorElement>(`.lp-nav-links a[href="#${id}"]`);
        if (a) links.set(id, a);
      }

      const mark = (id: string) => {
        for (const [key, a] of links) {
          if (key === id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        }
      };

      io = new IntersectionObserver(
        (entries) => {
          let hit: IntersectionObserverEntry | undefined;
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            if (!hit || e.boundingClientRect.top < hit.boundingClientRect.top) hit = e;
          }
          if (hit) mark(hit.target.id);
          else if (window.scrollY < 200) mark("");
        },
        { rootMargin: "-35% 0px -55% 0px" },
      );
      for (const s of sections) io.observe(s);
    };

    observe();
    window.addEventListener("lp:sections-changed", observe);
    return () => {
      window.removeEventListener("lp:sections-changed", observe);
      io?.disconnect();
    };
  }, [ids]);

  return null;
}
