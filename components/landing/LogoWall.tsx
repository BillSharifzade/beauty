import { asset } from "@/lib/asset";

/**
 * The partner brands, as they draw themselves.
 *
 * These are the brands' own tiles, vendored under public/brand/logos so the
 * page depends on nothing but the checkout. The wall is logos and nothing
 * else: no country, no category, no count under each one.
 *
 * The row drifts once, slowly, because the point is breadth. Two identical
 * runs sit side by side and the track slides by exactly one run, so the loop
 * has no seam; the second run is hidden from assistive technology and from
 * anyone who asked for less motion. The tiles load eagerly on purpose: a
 * lazy image in a moving row arrives late and changes the row's width under
 * the animation, which reads as a stutter.
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
  const run = (dup: boolean) => (
    <ul className={dup ? "lp-marquee-run lp-marquee-run--dup" : "lp-marquee-run"} aria-hidden={dup || undefined}>
      {brands.map((b) => (
        <li key={b.slug} className="lp-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(`/brand/logos/${b.slug}.webp`)}
            alt={dup ? "" : b.name}
            height={36}
            loading="eager"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="lp-marquee">
      <div className="lp-marquee-track">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
