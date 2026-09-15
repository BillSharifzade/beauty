import type { Object3D } from "three";
import type { ProductId } from "./config/types";

/**
 * The wiring between the components that draw the products and the rig that
 * animates them.
 *
 * Deliberately not React state: the rig writes to these objects sixty times a
 * second and a re-render per frame would be the whole performance budget. The
 * maps are filled by ref callbacks and read inside useFrame. Part keys are
 * `product/part`, see partKey in config/types.ts.
 */
export interface ProductHandles {
  /** One group per product: the rig places it on its slot and yaws it. */
  products: Map<ProductId, Object3D>;
  parts: Map<string, Object3D>;
  /** Parts that change shape rather than place: the labels wrap. */
  deformers: Map<string, (t: number) => void>;
}

export function createHandles(): ProductHandles {
  return { products: new Map(), parts: new Map(), deformers: new Map() };
}
