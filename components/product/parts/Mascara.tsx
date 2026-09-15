"use client";

import { useLayoutEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import type { ProductHandles } from "../handles";
import { MASCARA_BRUSH_ROWS, MASCARA_WAND_PIVOT } from "./geometry";
import type { CollectionAssets } from "./assets";
import { Part } from "./Part";

/**
 * 04 · The mascara: a black lacquered tube, a metal collar, the wand with its
 * brush, a matching cap. The brush is twenty-six thin discs of two
 * alternating radii in one instanced draw call, tapering toward the end:
 * at hero distance that is exactly what bristle rows look like, at a
 * thousandth of the cost of bristles.
 */
export function Mascara({ handles, a }: { handles: ProductHandles; a: CollectionAssets }) {
  const m = a.materials;
  const g = a.mascara;
  const id = "mascara" as const;
  const brush = useRef<InstancedMesh>(null);

  // Product-space y of the stem's centre and the brush core's centre, moved
  // onto the wand's own pivot.
  const stemY = 0.095 - MASCARA_WAND_PIVOT;
  const coreY = -0.375 - MASCARA_WAND_PIVOT;

  useLayoutEffect(() => {
    const mesh = brush.current;
    if (!mesh) return;
    const dummy = new Object3D();
    for (let i = 0; i < MASCARA_BRUSH_ROWS; i += 1) {
      const taper = 1 - (i / MASCARA_BRUSH_ROWS) * 0.4;
      const radius = (i % 2 === 0 ? 0.06 : 0.048) * taper;
      const y = -0.17 - i * 0.0164 - MASCARA_WAND_PIVOT;
      dummy.position.set(0, y, 0);
      dummy.rotation.set(0, i * 0.7, 0);
      dummy.scale.set(radius, 0.007, radius);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
  }, [a]);

  return (
    <>
      <Part product={id} id="Tube" handles={handles}>
        <mesh geometry={g.tube} material={m.lacquerBlack} castShadow />
      </Part>

      <Part product={id} id="Label" handles={handles}>
        <mesh geometry={a.strips.mascara.geometry} material={a.labelMaterials.mascara} />
      </Part>

      <Part product={id} id="Collar" handles={handles}>
        <mesh geometry={g.collar} material={m.metal} />
      </Part>

      <Part product={id} id="Wand" handles={handles}>
        <mesh geometry={g.stem} material={m.lacquerBlack} position={[0, stemY, 0]} />
        <mesh geometry={g.core} material={m.bristle} position={[0, coreY, 0]} />
        <instancedMesh ref={brush} args={[g.bristle, m.bristle, MASCARA_BRUSH_ROWS]} />
      </Part>

      <Part product={id} id="Cap" handles={handles}>
        <mesh geometry={g.cap} material={m.lacquerBlack} castShadow />
      </Part>
    </>
  );
}
