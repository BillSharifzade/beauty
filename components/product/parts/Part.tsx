"use client";

import { useCallback, type ReactNode } from "react";
import type { Object3D } from "three";
import { partKey, type ProductId } from "../config/types";
import type { ProductHandles } from "../handles";

/**
 * One named part of a product.
 *
 * The group carries the part's name so the rig can find it. Position,
 * rotation and scale are deliberately not props: the rig owns them from the
 * first frame, and setting them here too would mean two writers for one
 * value.
 */
export function Part({
  product,
  id,
  handles,
  children,
}: {
  product: ProductId;
  id: string;
  handles: ProductHandles;
  children: ReactNode;
}) {
  const key = partKey(product, id);
  const ref = useCallback(
    (object: Object3D | null) => {
      if (!object) return undefined;
      handles.parts.set(key, object);
      return () => {
        handles.parts.delete(key);
      };
    },
    [key, handles],
  );

  return (
    <group ref={ref} name={key}>
      {children}
    </group>
  );
}
