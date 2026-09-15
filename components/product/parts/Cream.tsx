"use client";

import type { ProductHandles } from "../handles";
import type { CollectionAssets } from "./assets";
import { Part } from "./Part";

/**
 * 01 · The cream: a squat, thick-walled glass jar, the cream rising inside
 * it, a protective disc, a paper band, a white lacquered lid with the mark
 * printed on top. The first product to assemble and the lowest in the row.
 */
export function Cream({ handles, a }: { handles: ProductHandles; a: CollectionAssets }) {
  const m = a.materials;
  const g = a.cream;
  const id = "cream" as const;

  return (
    <>
      <Part product={id} id="Jar_Body" handles={handles}>
        <mesh geometry={g.jar} material={m.glassThick} castShadow />
      </Part>

      <Part product={id} id="Cream" handles={handles}>
        <mesh geometry={g.fill} material={m.cream} />
      </Part>

      <Part product={id} id="Inner_Disc" handles={handles}>
        <mesh geometry={g.disc} material={m.satinWhite} />
      </Part>

      <Part product={id} id="Label" handles={handles}>
        <mesh geometry={a.strips.cream.geometry} material={a.labelMaterials.cream} />
      </Part>

      <Part product={id} id="Lid" handles={handles}>
        <mesh geometry={g.lid} material={m.lacquerWhite} castShadow />
      </Part>

      <Part product={id} id="Logo" handles={handles}>
        <mesh geometry={a.lidLogoPlane} material={a.logoMaterial} visible={a.logoReady} />
      </Part>
    </>
  );
}
