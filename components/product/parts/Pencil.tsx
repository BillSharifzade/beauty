"use client";

import type { ProductHandles } from "../handles";
import type { CollectionAssets } from "./assets";
import { Part } from "./Part";

/**
 * 05 · The pencil: a pink lacquered body, a metal band, the sharpened tip
 * with its black core, and a cap that lands on the ground beside it rather
 * than back on the point — a pencil is shown with its point.
 */
export function Pencil({ handles, a }: { handles: ProductHandles; a: CollectionAssets }) {
  const m = a.materials;
  const g = a.pencil;
  const id = "pencil" as const;

  return (
    <>
      <Part product={id} id="Body" handles={handles}>
        <mesh geometry={g.body} material={m.lacquerPink} castShadow />
      </Part>

      <Part product={id} id="Label" handles={handles}>
        <mesh geometry={a.strips.pencil.geometry} material={a.labelMaterials.pencil} />
      </Part>

      <Part product={id} id="Ring" handles={handles}>
        <mesh geometry={g.ring} material={m.metal} />
      </Part>

      <Part product={id} id="Tip" handles={handles}>
        <mesh geometry={g.wood} material={m.wood} castShadow />
        <mesh geometry={g.core} material={m.lacquerBlack} />
      </Part>

      <Part product={id} id="Cap" handles={handles}>
        <mesh geometry={g.cap} material={m.lacquerBlack} castShadow />
      </Part>
    </>
  );
}
