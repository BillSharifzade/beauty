import type { EaseName } from "../easing";

/**
 * The contract between the collection and the scroll rig.
 *
 * Five products assemble one after another inside one pinned scroll range,
 * then stand together for the closing shot. Everything the rig knows about
 * them is a value of this shape: where each product stands, when it
 * assembles, where its parts start and end, how the camera looks at it.
 * The rig reads the config and nothing else, so a sixth product is a new
 * entry in `products` plus a component that draws its parts — not a change
 * to the controller.
 */

export type Vec3 = readonly [number, number, number];

/** A curve sampled by progress: [progress, value] pairs, smoothstepped between. */
export type Pairs = readonly (readonly [number, number])[];

export type ProductId = "cream" | "tint" | "shampoo" | "mascara" | "pencil";

export interface Pose {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

/**
 * The small movements that stop the assembly reading as a queue of linear
 * tweens. All of them peak mid-travel and are gone by the time the part
 * lands, because a bounce at the end of a mechanical fit is a cartoon.
 */
export interface SecondaryMotion {
  /** Extra yaw, radians, peaking halfway through the travel. */
  spin?: number;
  /** Damped roll oscillation while the part is in flight, radians. */
  sway?: number;
  /** A single damped nudge along Y just after the part lands, world units. */
  settle?: number;
  /** Never-ending slow motion for things that are not solid: a liquid keeps
   *  turning under its own weight for as long as it is on screen. */
  drift?: { yaw: number; roll: number };
}

export interface PartSpec {
  /** Where the part floats before assembly, relative to the product's origin. */
  exploded: Pose;
  /** Where it ends up, relative to the product's origin. */
  assembled: Pose;
  /** The stretch of the product's own 0–1 progress in which the part travels. */
  window: readonly [number, number];
  ease: EaseName;
  /** Depth factor for the idle drift of the exploded stage (0 = still). */
  parallax: number;
  secondary?: SecondaryMotion;
  /** Parts that fill instead of flying: local scale.y runs 0 → 1 here. */
  fill?: readonly [number, number];
  /** Parts whose geometry wraps onto a body: bend runs 0 → 1 here. */
  bend?: readonly [number, number];
}

export interface ProductSpec {
  id: ProductId;
  /** Where the finished product stands: a row on wide screens... */
  slot: Vec3;
  /** ...and a tight cluster with depth on phones, where a row would not fit. */
  slotCompact: Vec3;
  /** The stretch of the page's 0–1 progress in which this product assembles. */
  window: readonly [number, number];
  /** Yaw of the whole product over its own progress: engineering view first,
   *  then the slow turn into a three-quarter. */
  yaw: Pairs;
  camera: {
    /** Camera offset from the product's origin at the start of its window... */
    from: Vec3;
    /** ...and at the end, a touch closer: the dolly-in of a product film. */
    to: Vec3;
    /** Where the camera looks, relative to the product's origin. */
    target: Vec3;
  };
  parts: Readonly<Record<string, PartSpec>>;
}

export interface CameraShot {
  position: Vec3;
  target: Vec3;
}

export interface SceneConfig {
  /** Lifts the whole collection so its mass sits on the optical centre. */
  offset: Vec3;
  /** Ground plane height in model space. */
  ground: number;
  products: readonly ProductSpec[];
  camera: {
    fov: number;
    fovCompact: number;
    /** The opening frame, before anything has started moving. */
    overview: CameraShot;
    overviewCompact: CameraShot;
    /** The closing frame: everything standing together. */
    lineup: CameraShot;
    lineupCompact: CameraShot;
    /** Progress at which the camera starts pulling back into the lineup. */
    lineupAt: number;
    /** Mouse parallax in radians, applied on top of the look-at. */
    parallax: { x: number; y: number };
    /** Per-frame approach factor toward the target framing. */
    lerp: number;
  };
  /** Exploded offsets are multiplied per axis on small screens. */
  compactExplode: Vec3;
  idle: {
    /** Vertical float amplitude of the finished shot, world units. */
    float: number;
    /** Yaw amplitude of the finished shot, radians. */
    yaw: number;
  };
  environment: {
    resolution: number;
    resolutionCompact: number;
  };
  shadow: {
    opacity: number;
  };
}

/** The key the rig files a part under: product id and part name. */
export const partKey = (product: ProductId, part: string): string => `${product}/${part}`;
