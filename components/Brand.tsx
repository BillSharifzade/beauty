/**
 * The mark and the wordmark, drawn once.
 *
 * Velvé's monogram is two petals meeting at their stems, which is a V when
 * read as letters and a flower when read as a picture, on the brand's
 * magenta tile. It is drawn as vector rather than dropped in as a PNG so it
 * stays crisp at 24px in a bar and at 96px on a card, and the same artwork
 * lives in public/brand/mark.svg for the favicon and public/brand/monogram.svg
 * for the products in the 3D scene.
 */

export function Mark({
  size = 28,
  className,
  title = "Velvé",
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
      aria-hidden={title === "" ? true : undefined}
    >
      {/* Flat brand pink: a gradient reads as generated, a colour reads as a brand. */}
      <rect width="64" height="64" rx="18" fill="#f400a1" />
      <path d="M32 47C22 42 15 29 19.5 17.5C28 23 34 36 32 47Z" fill="#fff" />
      <path d="M32 47C42 42 49 29 44.5 17.5C36 23 30 36 32 47Z" fill="#fff" fillOpacity=".8" />
    </svg>
  );
}

/** «VELVÉ», set the way the labels set it: serif capitals, wide. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={["wordmark", className ?? ""].join(" ").trim()}>Velvé</span>;
}
