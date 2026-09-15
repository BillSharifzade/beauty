import type { Object3D } from "three";
import type { PartKey } from "./config/types";

/**
 * The wiring between whichever component drew the product and the rig that
 * animates it.
 *
 * Deliberately not React state: the rig writes to these objects sixty times a
 * second and a re-render per frame would be the whole performance budget. The
 * maps are filled by ref callbacks and read inside useFrame.
 */
export interface ProductHandles {
  parts: Map<PartKey, Object3D>;
  /** Parts that change shape rather than place. The label wraps; a GLB model
   *  can leave this empty and the rig simply has nothing to bend. */
  deformers: Map<PartKey, (t: number) => void>;
}

export function createHandles(): ProductHandles {
  return { parts: new Map(), deformers: new Map() };
}
