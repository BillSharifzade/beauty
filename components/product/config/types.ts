import type { EaseName } from "../easing";

/**
 * The contract between a product and the scroll rig.
 *
 * Everything the assembly sequence knows about the shampoo lives in a value of
 * this shape. The rig reads it and nothing else, so putting a perfume, a serum
 * or a phone on the landing page tomorrow is a new config file plus a new set
 * of meshes — not a new controller.
 */

export type Vec3 = readonly [number, number, number];

/** The ten meshes the sequence drives, named exactly as the GLB must name them. */
export const PART_KEYS = [
  "Bottle_Body",
  "Liquid",
  "Pump_Base",
  "Pump_Head",
  "Pump_Tube",
  "Cap",
  "Label",
  "Logo",
  "Inner_Component_01",
  "Inner_Component_02",
] as const;

export type PartKey = (typeof PART_KEYS)[number];

export interface Pose {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

/**
 * The small movements that stop the assembly reading as ten linear tweens.
 * All of them peak mid-travel and are gone by the time the part lands, because
 * a bounce at the end of a mechanical fit is a cartoon, not a product film.
 */
export interface SecondaryMotion {
  /** Extra yaw, radians, peaking halfway through the travel. */
  spin?: number;
  /** Damped roll oscillation while the part is in flight, radians. */
  sway?: number;
  /** A single damped nudge along Y just after the part lands, world units. */
  settle?: number;
  /** Never-ending slow motion, for things that are not solid: the liquid keeps
   *  turning and rolling under its own weight for as long as it is on screen. */
  drift?: { yaw: number; roll: number };
}

export interface PartSpec {
  exploded: Pose;
  assembled: Pose;
  /** Scroll progress window in which this part travels. */
  window: readonly [number, number];
  ease: EaseName;
  /** Depth factor for the idle drift of the exploded stage (0 = still). */
  parallax: number;
  secondary?: SecondaryMotion;
  /** Parts that fill instead of flying: local scale.y runs 0 → 1 here. */
  fill?: readonly [number, number];
  /** Parts whose geometry wraps onto the bottle: bend runs 0 → 1 here. */
  bend?: readonly [number, number];
}

export interface CameraKey {
  /** Scroll progress this key belongs to. */
  at: number;
  position: Vec3;
  /** Where the camera looks. Shifting this, rather than the model, is how the
   *  product moves off centre to make room for the closing copy. */
  target: Vec3;
}

export interface ProductConfig {
  /** Lifts the assembled product so its mass sits on the optical centre. */
  offset: Vec3;
  /** Yaw of the whole model over the scroll: [progress, radians]. */
  yaw: readonly (readonly [number, number])[];
  camera: {
    fov: number;
    fovCompact: number;
    keys: readonly CameraKey[];
    /** Separate framing for phones and tablets: portrait is much narrower than
     *  it is short, so the same keys would push half the exploded view out. */
    keysCompact: readonly CameraKey[];
    /** Mouse parallax in radians, applied on top of the look-at. */
    parallax: { x: number; y: number };
    /** Per-frame approach factor toward the target framing. */
    lerp: number;
    /**
     * How strictly the frame must hold every part, by progress: [progress, 0–1].
     *
     * At 1 the camera pulls back until nothing is cropped, which is the rule
     * for the exploded and assembly stages. At 0 the authored camera keys are
     * obeyed exactly, which is what a detail shot is: a deliberate crop.
     */
    fit: readonly (readonly [number, number])[];
  };
  /** Exploded offsets are multiplied per axis on small screens. */
  compactExplode: Vec3;
  idle: {
    /** Vertical float amplitude of the finished hero shot, world units. */
    float: number;
    /** Yaw amplitude of the finished hero shot, radians. */
    yaw: number;
  };
  environment: {
    /** Point this at a file under public/hdri to use a real studio probe
     *  instead of the built-in softboxes. */
    hdr: string | null;
    resolution: number;
    resolutionCompact: number;
  };
  model: {
    /** Point this at a file under public/models to swap in a real GLB. */
    glb: string | null;
    /** Draco decoder directory, served from public/. */
    draco: string;
  };
  shadow: {
    /** Ground plane height in model space. */
    y: number;
    opacity: number;
    /** The shadow only makes sense once the product stands on the ground. */
    window: readonly [number, number];
  };
  parts: Readonly<Record<PartKey, PartSpec>>;
}
