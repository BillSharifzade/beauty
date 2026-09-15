"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { Mesh } from "three";
import { PART_KEYS, type PartKey } from "../config/types";
import type { ProductHandles } from "../handles";

/**
 * The same product, loaded from a GLB.
 *
 * The second source of parts, switched on by pointing config.model.glb at a
 * file under public/models. Nothing else changes: the loader looks up the ten
 * names from PART_KEYS in the loaded scene and hands the rig the same handles
 * the procedural bottle hands it.
 *
 * Two failure modes, handled differently on purpose:
 *
 * - The file will not load at all. useGLTF throws, the boundary above catches
 *   it and the procedural bottle takes over. A landing page that goes blank
 *   because an artist renamed a file is not acceptable.
 * - The file loads but is named wrong. That is a modelling mistake worth
 *   shouting about, so the missing names are logged; if none of them match we
 *   throw during render, which puts us back on the procedural bottle rather
 *   than pinning a static prop for six screens of scrolling.
 *
 * See components/product/README.md for the mesh names, orientation, units and
 * the Blender export settings that produce them.
 */
export function GltfProduct({
  url,
  draco,
  handles,
}: {
  url: string;
  draco: string;
  handles: ProductHandles;
}) {
  const { scene } = useGLTF(url, draco);

  const found = useMemo(() => {
    const map = new Map<PartKey, ReturnType<typeof scene.getObjectByName>>();
    for (const key of PART_KEYS) map.set(key, scene.getObjectByName(key));
    return map;
  }, [scene]);

  const hits = [...found.values()].filter((object) => object !== undefined).length;
  if (hits === 0) {
    throw new Error(
      `[product] ${url} contains none of the expected part names (${PART_KEYS.join(", ")})`,
    );
  }

  useEffect(() => {
    const missing: PartKey[] = [];
    for (const key of PART_KEYS) {
      const object = found.get(key);
      if (object) handles.parts.set(key, object);
      else missing.push(key);
    }
    if (missing.length > 0) {
      console.warn(`[product] ${url} is missing named parts: ${missing.join(", ")}`);
    }
    scene.traverse((object) => {
      if (object instanceof Mesh) object.castShadow = true;
    });
    return () => {
      for (const key of PART_KEYS) handles.parts.delete(key);
    };
  }, [found, handles, scene, url]);

  return <primitive object={scene} />;
}
