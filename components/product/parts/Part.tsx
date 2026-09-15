"use client";

import { useCallback, type ReactNode } from "react";
import type { Object3D } from "three";
import type { PartKey } from "../config/types";
import type { ProductHandles } from "../handles";

/**
 * One named part of the product.
 *
 * The group carries the name the GLB would carry, so the procedural bottle and
 * a modelled one are indistinguishable to the rig. Position, rotation and
 * scale are deliberately not props: the rig owns them from the first frame,
 * and setting them here too would mean two writers for one value.
 */
export function Part({
  id,
  handles,
  children,
}: {
  id: PartKey;
  handles: ProductHandles;
  children: ReactNode;
}) {
  const ref = useCallback(
    (object: Object3D | null) => {
      if (!object) return undefined;
      handles.parts.set(id, object);
      return () => {
        handles.parts.delete(id);
      };
    },
    [id, handles],
  );

  return (
    <group ref={ref} name={id}>
      {children}
    </group>
  );
}
