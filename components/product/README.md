# The hero: a pinned assembly of the collection

Section `#hero` on the landing: nine screens of scrolling, inside which one
screen stays still while five products assemble themselves from thirty-two
parts and then stand together. Everything is a pure function of one number,
the scroll progress from 0 to 1.

```
components/product/
  ProductScrollSection.tsx  the section: pin, loader, fallbacks, still mode
  ProductScene.tsx          <Canvas> and the rig (the only useFrame)
  Collection.tsx            the five products under their named groups
  Copy.tsx                  the opening statement, captions, the close
  Lighting.tsx              studio from Lightformers + the animated lights
  ScrollController.ts       GSAP timeline and the progress store
  easing.ts                 curves the config refers to by name
  handles.ts                the bridge between the models and the rig
  hooks.ts                  reduced motion, WebGL, narrow screen, mounted
  config/
    types.ts                the contract «collection → rig»
    products.ts             the five products: poses, windows, camera, slots
  parts/
    assets.ts               geometry, materials, labels, the mark — built once
    geometry.ts             lathe profiles and the bendable label strip
    materials.ts            one set of finishes shared by every product
    textures.ts             the printed labels, noise map, mark loader
    Part.tsx                one named part of a product
    Cream.tsx … Pencil.tsx  the products, each a list of parts and finishes
```

Styles are in `app/product.css`.

## How the sequence is built

`config/products.ts` describes each product: where it stands (`slot` on wide
screens, `slotCompact` on phones), when it assembles (`window`, a stretch of
the page's progress), how it turns (`yaw`), how the camera looks at it, and
its parts. Every part has an `exploded` and an `assembled` pose relative to
the product's origin, a `window` inside the product's own 0–1 progress, an
easing, and optional secondary motion. Parts that fill (`fill`) scale in y
from a bottom pivot; labels (`bend`) wrap onto their body.

The camera's path is derived, not authored: an overview, then for each
product a shot at the start of its window and a closer one at the end, then
the lineup. Between keys it glides; inside a window it dollies in. A measured
fit pushes the camera back whenever the shot would crop a part, so 1440×900,
1366×768 and a 390-wide phone are all safe from the same numbers.

To add a product: a new entry in `products`, a component under `parts/` that
draws its parts with `<Part product="…" id="…">`, a line in `Collection.tsx`,
a caption in `Copy.tsx`, and a card on the page.

## Performance

* One `useFrame` for the whole section. Progress is a mutable field, not
  React state: a value that changes every frame must never cause a render.
* One set of materials for all five products, built once in `assets.ts`.
* One transparent surface per product (its glass); everything inside has
  transmission exactly zero, which is a requirement of the engine rather than
  a choice — the transmission pass draws only opaque objects.
* The mascara brush is one instanced draw call of twenty-six discs.
* The render loop stops (`frameloop="demand"`) while the pinned frame is off
  screen and under reduced motion.
* `dpr` [1, 1.6] on desktop and [1, 1.25] on phones, `PerformanceMonitor` and
  `AdaptiveDpr`, half the lathe segments and a smaller noise map on phones,
  directional shadows off there, `transmissionResolutionScale` 0.5.

## Fallbacks

| Condition | What happens |
| --- | --- |
| `prefers-reduced-motion: reduce` | no pin, no assembly: one screen with the finished collection, the opening statement and the buttons |
| No WebGL | no canvas at all; `public/brand/poster.webp` and the same copy |
| No JavaScript | the server-rendered heading and copy over the poster |
| No 2D context for textures | labels and the mark are skipped, the products remain |

## Stills

`?still=cream|tint|shampoo|mascara|pencil|lineup` renders one authored frame
with the page chrome hidden (`?copy=1` keeps the closing copy, for the
OpenGraph image). `scripts/stills.mjs` at the repository root drives this
through headless Chrome and writes the files under `public/brand`.
