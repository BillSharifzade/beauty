"use client";

import type { ProductHandles } from "../handles";
import { TINT_WAND_PIVOT } from "./geometry";
import type { CollectionAssets } from "./assets";
import { Part } from "./Part";

/**
 * 02 · The tint: a small glass bottle of rose colour, a metal collar, a
 * doe-foot wand that slides down into it, a black lacquered cap.
 */
export function Tint({ handles, a }: { handles: ProductHandles; a: CollectionAssets }) {
  const m = a.materials;
  const g = a.tint;
  const id = "tint" as const;

  // The stem runs from y = -0.6 to -0.05 in the product's space; the wand's
  // pivot is the centre of stem plus tip, so the stem sits above it.
  const stemY = -0.325 - TINT_WAND_PIVOT;

  return (
    <>
      <Part product={id} id="Bottle" handles={handles}>
        <mesh geometry={g.bottle} material={m.glassRose} castShadow />
      </Part>

      <Part product={id} id="Liquid" handles={handles}>
        <mesh geometry={g.liquid} material={m.rose} />
      </Part>

      <Part product={id} id="Label" handles={handles}>
        <mesh geometry={a.strips.tint.geometry} material={a.labelMaterials.tint} />
      </Part>

      <Part product={id} id="Collar" handles={handles}>
        <mesh geometry={g.collar} material={m.metal} />
      </Part>

      {/* The doe-foot is a lathe flattened in z: round in one view, a blade
          in the other, which is what the applicator actually is. */}
      <Part product={id} id="Wand" handles={handles}>
        <mesh geometry={g.stem} material={m.lacquerBlack} position={[0, stemY, 0]} />
        <mesh geometry={g.tip} material={m.flock} scale={[1, 1, 0.62]} />
      </Part>

      <Part product={id} id="Cap" handles={handles}>
        <mesh geometry={g.cap} material={m.lacquerBlack} castShadow />
      </Part>
    </>
  );
}
