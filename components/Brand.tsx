/**
 * The mark and the wordmark, drawn once.
 *
 * Hayat Beauty's monogram is a ring broken into three arcs around the letters
 * HB, on the brand's magenta. It is redrawn here as vector rather than dropped
 * in as the shop's PNG so it stays crisp at 24px in a sidebar and at 96px on a
 * sign-in card, takes the current theme's beam, and never ships a raster
 * nobody can recolour. The letters are strokes on purpose: a monoline HB reads
 * at any size, where the shop's own serifed H needs 40px to survive.
 */

export function Mark({
  size = 28,
  className,
  title = "Hayat Beauty",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
    >
      {/* Flat brand pink: a gradient reads as generated, a colour reads as a brand. */}
      <rect width="64" height="64" rx="18" fill="#f400a1" />
      {/* Three arcs. A full ring reads as a badge; the gaps are the brand. */}
      <circle
        cx="32"
        cy="32"
        r="24.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="40 11.3"
        transform="rotate(-100 32 32)"
      />
      <path
        d="M20 23v18M20 32h11M31 23v18M38 23v18M38 23h6a4 4 0 0 1 0 8h-6M38 31h7a4.6 4.6 0 0 1 0 9.2h-7"
        fill="none"
        stroke="#fff"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** «HAYAT BEAUTY», set the way the shop sets it: wide, upright, all caps. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={["wordmark", className ?? ""].join(" ").trim()}>Hayat Beauty</span>;
}

/** The mark beside the wordmark — the lockup used at the top of every shell.
 *  `sub` names the surface under the wordmark: «ассистент» in the chat, «панель
 *  магазина» in the admin, so the two shells are the one brand, not two apps. */
export function Brand({
  size = 28,
  compact = false,
  sub = "ассистент",
}: {
  size?: number;
  compact?: boolean;
  sub?: string;
}) {
  return (
    <span className="brand" aria-label="Hayat Beauty">
      <Mark size={size} className="brand-mark" title="" />
      {!compact && (
        <span className="brand-text">
          <Wordmark />
          <span className="brand-sub">{sub}</span>
        </span>
      )}
    </span>
  );
}
