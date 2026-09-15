"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import { readTheme, resolvedTheme, setTheme, THEME_EVENT, type Theme } from "@/lib/theme";

const order: Theme[] = ["system", "light", "dark"];
const labels: Record<Theme, string> = {
  system: "как в системе",
  light: "светлая",
  dark: "тёмная",
};

/**
 * The theme control.
 *
 * Two shapes: a segmented row with the three choices where there is room
 * (settings, the admin rail), and one icon button that cycles through them
 * where there is not (a top bar). Both read the stored choice after mount,
 * never during render, so the server and the first client paint agree.
 */
export function ThemeToggle({
  compact = false,
  size = "md",
}: {
  compact?: boolean;
  size?: "sm" | "md";
}) {
  const [theme, setState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const sync = () => {
      const t = readTheme();
      setState(t);
      setResolved(resolvedTheme(t));
    };
    sync();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    window.addEventListener(THEME_EVENT, sync);
    mq.addEventListener("change", sync);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      mq.removeEventListener("change", sync);
    };
  }, []);

  if (compact) {
    const next: Theme = order[(order.indexOf(theme) + 1) % order.length] ?? "system";
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-icon theme-toggle"
        onClick={() => setTheme(next)}
        aria-label={`Тема: ${labels[theme]}. Переключить: ${labels[next]}`}
        title={`Тема: ${labels[theme]}`}
        data-theme-choice={theme}
      >
        {resolved === "dark" ? <MoonIcon /> : <SunIcon />}
      </button>
    );
  }

  return (
    <div
      className={size === "sm" ? "segmented segmented--sm theme-seg" : "segmented theme-seg"}
      role="group"
      aria-label="Тема оформления"
    >
      {order.map((t) => (
        <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
          {t === "light" && <SunIcon />}
          {t === "dark" && <MoonIcon />}
          {t === "system" ? "Авто" : t === "light" ? "Светлая" : "Тёмная"}
        </button>
      ))}
    </div>
  );
}
