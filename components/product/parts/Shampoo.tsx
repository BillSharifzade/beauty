"use client";

import type { ProductHandles } from "../handles";
import type { CollectionAssets } from "./assets";
import { Part } from "./Part";

/**
 * 03 · The shampoo: ten parts, the most of any product in the collection,
 * and the one in the middle of the row. A clear pump bottle with a pearl
 * formula, a pink closure and a white dispenser.
 */
export function Shampoo({ handles, a }: { handles: ProductHandles; a: CollectionAssets }) {
  const m = a.materials;
  const g = a.shampoo;
  const id = "shampoo" as const;

  return (
    <>
      <Part product={id} id="Bottle_Body" handles={handles}>
        <mesh geometry={g.body} material={m.glass} castShadow />
      </Part>

      {/* The milkiness of the product belongs here, not to the bottle: this is
          the pearlescent shampoo, and the wall around it is clear. */}
      <Part product={id} id="Liquid" handles={handles}>
        <mesh geometry={g.liquid} material={m.pearl} />
      </Part>

      <Part product={id} id="Inner_Component_01" handles={handles}>
        <mesh geometry={g.foot} material={m.inner} />
      </Part>

      <Part product={id} id="Inner_Component_02" handles={handles}>
        <mesh geometry={g.ring} material={m.inner} />
      </Part>

      <Part product={id} id="Label" handles={handles}>
        <mesh geometry={a.strips.shampoo.geometry} material={a.labelMaterials.shampoo} />
      </Part>

      <Part product={id} id="Logo" handles={handles}>
        <mesh geometry={a.logoPlane} material={a.logoMaterial} visible={a.logoReady} />
      </Part>

      <Part product={id} id="Pump_Tube" handles={handles}>
        <mesh geometry={g.dipTube} material={m.satinGrey} />
      </Part>

      <Part product={id} id="Cap" handles={handles}>
        <mesh geometry={g.cap} material={m.lacquerPink} castShadow />
      </Part>

      <Part product={id} id="Pump_Base" handles={handles}>
        <mesh geometry={g.pumpBase} material={m.lacquerWhite} castShadow />
      </Part>

      {/* The actuator is three meshes under one named group: the body, the
          spout and its nozzle. Keeping them apart costs nothing and lets the
          spout tilt on its own. */}
      <Part product={id} id="Pump_Head" handles={handles}>
        <mesh geometry={g.pumpHead} material={m.lacquerWhite} castShadow />
        <mesh
          geometry={g.spout}
          material={m.lacquerWhite}
          position={[-0.159, -0.014, 0]}
          rotation={[0, 0, Math.PI / 2 + 0.14]}
          castShadow
        />
        <mesh
          geometry={g.nozzle}
          material={m.nozzle}
          position={[-0.283, -0.032, 0]}
          rotation={[0, 0, Math.PI / 2 + 0.14]}
        />
      </Part>
    </>
  );
}
