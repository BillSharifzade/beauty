/**
 * A handful of real measurements as horizontal bars.
 *
 * HTML, not a chart runtime: four numbers do not need one, the page stays
 * static, and a screen reader gets the same figures a sighted reader does.
 * There is no grey track behind a bar on purpose. The bar's length against
 * its neighbours is the whole message, and a track would add a second,
 * invented maximum. The one vertical line is a reference the reader needs
 * (where the baseline sits), never decoration.
 */
export function Bars({
  items,
  max,
  format,
  reference,
  caption,
}: {
  items: { label: string; value: number; strong?: boolean }[];
  /** The value that fills the whole width. */
  max: number;
  format: (v: number) => string;
  /** A vertical line at this value, with the words that explain it. */
  reference?: { value: number; label: string };
  caption?: string;
}) {
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;

  return (
    <figure className="lp-bars">
      <ul className="lp-bars-list">
        {items.map((it) => (
          <li key={it.label} className={it.strong ? "lp-bar lp-bar--strong" : "lp-bar"}>
            <span className="lp-bar-label">{it.label}</span>
            <span className="lp-bar-lane" aria-hidden="true">
              <span className="lp-bar-fill" style={{ width: pct(it.value) }} />
              {reference && <span className="lp-bar-ref" style={{ left: pct(reference.value) }} />}
            </span>
            <span className="lp-bar-value tabular">{format(it.value)}</span>
          </li>
        ))}
      </ul>
      {(caption || reference) && (
        <figcaption className="lp-bars-caption">
          {caption}
          {reference && (
            <span className="lp-bars-ref-note">
              <span className="lp-bars-ref-swatch" aria-hidden="true" />
              {reference.label}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
