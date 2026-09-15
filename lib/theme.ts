/**
 * The colour theme, chosen by the person or left to the system.
 *
 * Three states, not two: «как в системе» is the default and stays the default
 * for anyone who never touches the control, because a phone that switches to
 * dark at sunset should take the app with it. A stored choice wins over the
 * system until it is cleared.
 *
 * The attribute goes on <html> so the tokens in globals.css can key off it,
 * and it is set twice: once by the inline script in layout.tsx before the
 * first paint (no flash), and again here whenever the choice changes.
 */

export type Theme = "system" | "light" | "dark";

export const THEME_KEY = "hb-theme";
export const THEME_EVENT = "hb-theme";

const bar = { light: "#f7f7f8", dark: "#0b0b0d" } as const;

export function readTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function resolvedTheme(t: Theme): "light" | "dark" {
  if (t !== "system") return t;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", t);

  // The browser chrome follows: one colour when the choice is explicit, the
  // per-scheme pair when it is left to the system.
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const scheme = t === "system" ? (meta.media.includes("dark") ? "dark" : "light") : t;
    meta.content = bar[scheme];
  }
}

export function setTheme(t: Theme) {
  try {
    if (t === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, t);
  } catch {
    // Private mode or storage disabled: the choice lasts for the page.
  }

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };

  if (!still && typeof doc.startViewTransition === "function") {
    // A cross-fade of the whole page: the browser snapshots before and after,
    // so every colour changes in one motion rather than element by element.
    doc.startViewTransition(() => applyTheme(t));
  } else if (!still) {
    // No View Transitions: let colours ease for a moment, then stop paying
    // for the transition on every repaint.
    const root = document.documentElement;
    root.classList.add("theme-fade");
    applyTheme(t);
    window.setTimeout(() => root.classList.remove("theme-fade"), 450);
  } else {
    applyTheme(t);
  }

  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: t }));
}
