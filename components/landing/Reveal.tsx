"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveals its children once, when they first come into view.
 *
 * Three rules the usual implementation of this gets wrong, and all three are
 * about not punishing the reader:
 *
 * 1. It reveals once and never hides again. Content that fades back out when
 *    scrolled past makes a page impossible to re-read, and re-reading is what
 *    people do when they are close to deciding.
 *
 * 2. Hiding is opt-in, not the default. The server-rendered markup and the
 *    first client paint both carry visible text; only after JavaScript has
 *    mounted — and is therefore able to reveal it again — does the document
 *    take the `js-ready` flag that lets `.reveal--hidden` mean anything. If
 *    the script never runs, never parses, or fails, the page is simply a page.
 *
 * 3. What is already on screen at load is never hidden. Arming it would cost
 *    a frame of blank text and buy no animation: there is no entrance to play
 *    for something the reader is already looking at.
 *
 * Printing reveals everything, in the stylesheet: a printed page has no
 * scrolling for an observer to watch.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "figure" | "dl" | "ul" | "aside";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) {
      setShown(true);
      return;
    }

    // The flag is what makes hiding legal at all, and it is set from here so
    // that a page whose script never ran cannot have it.
    document.documentElement.classList.add("js-ready");
    setArmed(true);

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${armed && !shown ? "reveal--hidden" : "reveal--shown"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
