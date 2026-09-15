# Velvé — landing

A presentation site for a beauty brand, published on GitHub Pages:
https://billsharifzade.github.io/beauty/

The page is one long scroll. Its hero is a pinned 3D sequence in which the
five products of the collection — cream, tint, shampoo, mascara and pencil —
assemble themselves out of thirty-two parts as the reader scrolls, then stand
together for the closing shot. Everything below it is static: manifesto,
numbers, the collection, the formula, partners, a close.

The brand is fictional; the partner logos under `public/brand/logos` are real
brands shown as a "sold alongside" wall.

## Run locally

```sh
npm install
npm run dev        # http://localhost:3020/beauty
```

## Deploy

Every push to `main` builds a static export (`next build`, `output: "export"`)
and publishes `out/` through the workflow in `.github/workflows/pages.yml`.
The site is served under `/beauty`, set as `basePath` in `next.config.ts`;
build with `BASE_PATH=""` for a root-hosted copy.

## Where things are

| Path | What |
| --- | --- |
| `app/page.tsx` | the page and all of its copy |
| `app/landing.css`, `app/product.css` | the page's styles and the hero's |
| `components/product/` | the 3D hero, see its own README |
| `components/collection/` | the live 3D product cards: one canvas, one view per card |
| `components/landing/` | preloader, reveal-on-scroll, word reveals, counters, nav spy, the logo wall |
| `public/brand/` | mark, icons, poster, product stills, partner logos |

## Rendering the poster and the OpenGraph image

The no-WebGL poster and the OpenGraph image are renders of the same 3D
scene, taken with `scripts/stills.mjs` from a running dev server:

```sh
npm run dev
node scripts/stills.mjs      # writes public/brand/poster.webp and og.png
```

The script drives Google Chrome headless through `puppeteer-core` (a dev
dependency), opening the page with `?still=lineup`, which the hero section
reads to render one authored frame with the chrome hidden. The product cards
need no stills: they are live views drawn by one shared canvas
(`components/collection/`).
