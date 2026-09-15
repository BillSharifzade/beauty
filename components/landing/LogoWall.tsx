import { asset } from "@/lib/asset";

/**
 * The partner brands, as they draw themselves.
 *
 * These are the brands' own tiles, vendored under
 * public/brand/logos so the page depends on nothing but the checkout. The
 * wall is logos and nothing else: no country, no category, no count under
 * each one. The row scrolls once, slowly, because the point is breadth; the
 * second copy exists only so the loop has no seam, and it is hidden from
 * assistive technology and from anyone who asked for less motion.
 */

const brands = [
  { slug: "beauty-of-joseon", name: "Beauty of Joseon" },
  { slug: "round-lab", name: "Round Lab" },
  { slug: "dr-althea", name: "Dr.Althea" },
  { slug: "skin1004", name: "SKIN1004" },
  { slug: "anua", name: "Anua" },
  { slug: "cosrx", name: "COSRX" },
  { slug: "torriden", name: "Torriden" },
  { slug: "some-by-mi", name: "Some By Mi" },
  { slug: "isntree", name: "Isntree" },
  { slug: "purito", name: "Purito" },
  { slug: "mixsoon", name: "Mixsoon" },
  { slug: "axis-y", name: "Axis-Y" },
  { slug: "topface", name: "Topface" },
  { slug: "catrice", name: "Catrice" },
  { slug: "vivienne-sabo", name: "Vivienne Sabo" },
  { slug: "maybelline", name: "Maybelline" },
  { slug: "loreal", name: "L'Oreal" },
  { slug: "garnier", name: "Garnier" },
  { slug: "la-roche-posay", name: "La Roche-Posay" },
  { slug: "bioderma", name: "Bioderma" },
];

export function LogoWall() {
  const row = (dup: boolean) =>
    brands.map((b) => (
      <li
        key={`${b.slug}${dup ? "-dup" : ""}`}
        className={dup ? "lp-logo lp-logo--dup" : "lp-logo"}
        aria-hidden={dup || undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(`/brand/logos/${b.slug}.webp`)}
          alt={dup ? "" : b.name}
          height={36}
          loading="lazy"
          decoding="async"
        />
      </li>
    ));

  return (
    <div className="lp-marquee">
      <ul className="lp-marquee-track">
        {row(false)}
        {row(true)}
      </ul>
    </div>
  );
}
