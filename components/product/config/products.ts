import type { Pose, ProductSpec, SceneConfig, Vec3 } from "./types";

/**
 * The collection, taken apart.
 *
 * Coordinates are model units, roughly decimetres. Every product is authored
 * in its own space with the ground at y = -0.75, then placed on its slot: a
 * row on wide screens, a cluster with depth on phones. The tallest product
 * (the shampoo, 1.96 high) sits in the middle of the row and the heights fall
 * away on either side, which is how a product family is photographed.
 *
 * Two rules held the exploded numbers in place:
 *
 * 1. A product's cloud stays within about ±0.8 of its own origin, so the
 *    clouds of neighbours only brush the edges of a close-up rather than
 *    drifting across it.
 * 2. Part windows follow the order a thing is actually put together: body,
 *    contents, label, closure. Parts that meet mechanically overlap slightly,
 *    so the fit reads as one movement instead of a queue.
 *
 * Pivots: every part's pivot is the centre of its bounding box, except the
 * parts that fill (`Liquid`, `Cream`) whose pivot is the bottom of the column
 * so that scale.y is literally a fill level. The geometry module reproduces
 * the same centres, so the numbers here and there have to agree.
 */

const V0: Vec3 = [0, 0, 0];
const ONE: Vec3 = [1, 1, 1];
const HALF_PI = Math.PI / 2;

const pose = (position: Vec3, rotation: Vec3 = V0): Pose => ({ position, rotation, scale: ONE });

/** Wrap radii for the labels: the body's wall plus the thickness of a printed
 *  film. Each label's arc length derives from its radius, so the wrap closes
 *  exactly on the surface instead of hovering or sinking into it. */
export const WRAP = {
  shampoo: 0.4235,
  cream: 0.4235,
  tint: 0.2085,
  mascara: 0.1385,
  pencil: 0.0805,
} as const;

/* ---- 01 · Cream ---------------------------------------------------------- */
const CREAM: ProductSpec = {
  id: "cream",
  slot: [-2.65, 0, 0.15],
  slotCompact: [-0.95, 0, 0.55],
  window: [0.06, 0.22],
  yaw: [
    [0, -0.35],
    [0.7, 0],
    [1, 0.16],
  ],
  camera: { from: [0.25, 0.28, 3.4], to: [0.1, 0.16, 3.05], target: [0, -0.42, 0] },
  parts: {
    Jar_Body: {
      exploded: pose([0.05, -0.28, 0.35], [0.12, -0.5, 0.05]),
      assembled: pose([0, -0.51, 0]),
      window: [0, 0.32],
      ease: "signature",
      parallax: 0.35,
      secondary: { spin: 0.1 },
    },
    // Rises inside the jar: the pivot is the jar's floor, scale.y the level.
    Cream: {
      exploded: pose([0, -0.71, 0]),
      assembled: pose([0, -0.71, 0]),
      window: [0.24, 0.52],
      fill: [0.24, 0.52],
      ease: "power2.out",
      parallax: 0,
      secondary: { drift: { yaw: 0.04, roll: 0.004 } },
    },
    Inner_Disc: {
      exploded: pose([-0.55, 0.18, -0.3], [0.9, 0.4, -0.3]),
      assembled: pose([0, -0.31, 0]),
      window: [0.44, 0.62],
      ease: "power2.inOut",
      parallax: 0.9,
      secondary: { spin: 0.5, sway: 0.08 },
    },
    Label: {
      exploded: pose([0.85, -0.22, 0.55], [0.1, -0.6, 0.15]),
      assembled: pose([0, -0.53, WRAP.cream]),
      window: [0.48, 0.7],
      bend: [0.56, 0.74],
      ease: "signature",
      parallax: 1,
      secondary: { sway: 0.06 },
    },
    Lid: {
      exploded: pose([0.15, 0.58, -0.15], [-0.35, 0.7, 0.2]),
      assembled: pose([0, -0.189, 0]),
      window: [0.66, 0.9],
      ease: "signature",
      parallax: 0.55,
      secondary: { spin: 0.35, settle: 0.012 },
    },
    Logo: {
      exploded: pose([-0.45, 0.8, 0.35], [-0.9, 0.5, -0.4]),
      assembled: pose([0, -0.086, 0], [-HALF_PI, 0, 0]),
      window: [0.84, 1],
      ease: "power3.out",
      parallax: 1.1,
    },
  },
};

/* ---- 02 · Tint ----------------------------------------------------------- */
const TINT: ProductSpec = {
  id: "tint",
  slot: [-1.45, 0, -0.1],
  slotCompact: [-0.45, 0, -0.35],
  window: [0.22, 0.38],
  yaw: [
    [0, -0.3],
    [0.7, 0],
    [1, 0.12],
  ],
  camera: { from: [0.2, 0.26, 3.5], to: [0.06, 0.18, 3.15], target: [0, -0.18, 0] },
  parts: {
    Bottle: {
      exploded: pose([0.02, -0.22, 0.3], [0.08, -0.5, 0.04]),
      assembled: pose([0, -0.4, 0]),
      window: [0, 0.3],
      ease: "signature",
      parallax: 0.35,
      secondary: { spin: 0.1 },
    },
    Liquid: {
      exploded: pose([0, -0.72, 0]),
      assembled: pose([0, -0.72, 0]),
      window: [0.22, 0.48],
      fill: [0.22, 0.48],
      ease: "power2.out",
      parallax: 0,
      secondary: { drift: { yaw: 0.05, roll: 0.006 } },
    },
    Label: {
      exploded: pose([0.7, -0.3, 0.45], [0.1, -0.7, 0.2]),
      assembled: pose([0, -0.45, WRAP.tint]),
      window: [0.36, 0.58],
      bend: [0.44, 0.62],
      ease: "signature",
      parallax: 1,
      secondary: { sway: 0.06 },
    },
    Collar: {
      exploded: pose([-0.5, 0.15, -0.2], [0.7, 0.3, -0.5]),
      assembled: pose([0, -0.085, 0]),
      window: [0.52, 0.68],
      ease: "power2.inOut",
      parallax: 0.8,
      secondary: { spin: 0.4 },
    },
    // Comes down from above and slides into the bottle; the stem stays
    // visible through the glass above the liquid line.
    Wand: {
      exploded: pose([0.55, 0.5, 0.15], [0, 0.4, 0.5]),
      assembled: pose([0, -0.385, 0]),
      window: [0.62, 0.84],
      ease: "signature",
      parallax: 0.7,
      secondary: { sway: 0.08 },
    },
    Cap: {
      exploded: pose([0.15, 1.1, -0.2], [-0.3, 0.8, 0.15]),
      assembled: pose([0, 0.22, 0]),
      window: [0.78, 1],
      ease: "signature",
      parallax: 0.5,
      secondary: { spin: 0.3, settle: 0.012 },
    },
  },
};

/* ---- 03 · Shampoo -------------------------------------------------------- */
const SHAMPOO: ProductSpec = {
  id: "shampoo",
  slot: [0, 0, 0],
  slotCompact: [0.05, 0, -0.6],
  window: [0.38, 0.6],
  yaw: [
    [0, -0.3],
    [0.75, 0],
    [1, 0.18],
  ],
  camera: { from: [0.3, 0.3, 5.0], to: [0.1, 0.2, 4.55], target: [0, 0.15, 0] },
  parts: {
    Bottle_Body: {
      exploded: pose([0.05, -0.18, 0.4], [0.1, -0.55, 0.06]),
      assembled: pose(V0),
      window: [0, 0.35],
      ease: "signature",
      parallax: 0.35,
      secondary: { spin: 0.12 },
    },
    Inner_Component_01: {
      exploded: pose([-0.72, -0.78, -0.45], [0.6, 0.9, -0.4]),
      assembled: pose([0, -0.56, 0]),
      window: [0.2, 0.41],
      ease: "power2.inOut",
      parallax: 0.9,
      secondary: { spin: 0.5, sway: 0.08 },
    },
    Inner_Component_02: {
      exploded: pose([0.7, -0.5, -0.65], [-0.7, 0.4, 0.5]),
      assembled: pose([0, 0.5, 0]),
      window: [0.23, 0.43],
      ease: "power2.inOut",
      parallax: 0.8,
      secondary: { spin: 0.4 },
    },
    Liquid: {
      exploded: pose([0, -0.714, 0]),
      assembled: pose([0, -0.714, 0]),
      window: [0.26, 0.52],
      fill: [0.26, 0.52],
      ease: "power2.out",
      parallax: 0,
      secondary: { drift: { yaw: 0.05, roll: 0.007 } },
    },
    Label: {
      exploded: pose([0.86, -0.3, 0.55], [0.15, -0.75, 0.22]),
      assembled: pose([0, 0.1, WRAP.shampoo]),
      window: [0.43, 0.68],
      bend: [0.49, 0.68],
      ease: "signature",
      parallax: 1,
      secondary: { sway: 0.06 },
    },
    Logo: {
      exploded: pose([0.62, 0.55, 0.9], [-0.3, 0.6, -0.5]),
      assembled: pose([0, -0.4, WRAP.shampoo + 0.009]),
      window: [0.52, 0.72],
      ease: "power3.out",
      parallax: 1.1,
    },
    Pump_Tube: {
      exploded: pose([0.7, 0.2, -0.35], [0, 0, 0.55]),
      assembled: pose([0, 0.05, 0]),
      window: [0.65, 0.81],
      ease: "signature",
      parallax: 0.7,
      secondary: { sway: 0.1 },
    },
    Cap: {
      exploded: pose([0.15, 1.2, -0.3], [-0.25, 0.8, 0.15]),
      assembled: pose([0, 0.85, 0]),
      window: [0.7, 0.87],
      ease: "signature",
      parallax: 0.5,
      secondary: { spin: 0.35, settle: 0.012 },
    },
    Pump_Base: {
      exploded: pose([-0.62, 1.0, 0.45], [0.3, -0.6, -0.25]),
      assembled: pose([0, 1.005, 0]),
      window: [0.75, 0.93],
      ease: "signature",
      parallax: 0.6,
      secondary: { spin: 0.28 },
    },
    Pump_Head: {
      exploded: pose([-0.2, 1.42, 0.2], [0.2, 1.1, 0.18]),
      assembled: pose([0, 1.13, 0]),
      window: [0.81, 1],
      ease: "power2.inOut",
      parallax: 0.55,
      secondary: { settle: 0.018 },
    },
  },
};

/* ---- 04 · Mascara -------------------------------------------------------- */
const MASCARA: ProductSpec = {
  id: "mascara",
  slot: [1.3, 0, -0.1],
  slotCompact: [0.55, 0, -0.15],
  window: [0.6, 0.74],
  yaw: [
    [0, -0.3],
    [0.7, 0],
    [1, 0.14],
  ],
  camera: { from: [0.25, 0.3, 4.4], to: [0.1, 0.2, 4.0], target: [0, 0.1, 0] },
  parts: {
    Tube: {
      exploded: pose([0.05, -0.12, 0.3], [0.1, -0.6, 0.05]),
      assembled: pose([0, -0.245, 0]),
      window: [0, 0.3],
      ease: "signature",
      parallax: 0.35,
      secondary: { spin: 0.1 },
    },
    Label: {
      exploded: pose([-0.75, -0.32, 0.5], [0.1, 0.7, -0.15]),
      assembled: pose([0, -0.3, WRAP.mascara]),
      window: [0.24, 0.46],
      bend: [0.32, 0.5],
      ease: "signature",
      parallax: 1,
      secondary: { sway: 0.06 },
    },
    Collar: {
      exploded: pose([-0.5, 0.6, -0.25], [0.8, 0.2, -0.4]),
      assembled: pose([0, 0.245, 0]),
      window: [0.44, 0.6],
      ease: "power2.inOut",
      parallax: 0.8,
      secondary: { spin: 0.4 },
    },
    // Tilted while it flies so the brush shows, upright as it drops in.
    Wand: {
      exploded: pose([0.62, 0.32, 0.22], [0, 0.3, 0.6]),
      assembled: pose([0, -0.13, 0]),
      window: [0.56, 0.8],
      ease: "signature",
      parallax: 0.7,
      secondary: { sway: 0.08 },
    },
    Cap: {
      exploded: pose([0.1, 1.5, -0.2], [-0.3, 0.9, 0.2]),
      assembled: pose([0, 0.66, 0]),
      window: [0.76, 1],
      ease: "signature",
      parallax: 0.5,
      secondary: { spin: 0.3, settle: 0.014 },
    },
  },
};

/* ---- 05 · Pencil --------------------------------------------------------- */
const PENCIL: ProductSpec = {
  id: "pencil",
  slot: [2.35, 0, 0.15],
  slotCompact: [0.95, 0, 0.45],
  window: [0.74, 0.86],
  yaw: [
    [0, -0.35],
    [0.7, 0],
    [1, 0.12],
  ],
  camera: { from: [0.3, 0.3, 4.3], to: [0.2, 0.2, 3.9], target: [0.2, -0.05, 0] },
  parts: {
    Body: {
      exploded: pose([0.02, -0.08, 0.25], [0.1, -0.4, 0.35]),
      assembled: pose([0, -0.085, 0]),
      window: [0, 0.32],
      ease: "signature",
      parallax: 0.35,
      secondary: { spin: 0.1 },
    },
    Label: {
      exploded: pose([-0.6, -0.2, 0.4], [0.1, 0.6, -0.1]),
      assembled: pose([0, -0.15, WRAP.pencil]),
      window: [0.26, 0.48],
      bend: [0.34, 0.52],
      ease: "signature",
      parallax: 1,
      secondary: { sway: 0.06 },
    },
    Ring: {
      exploded: pose([-0.4, 0.9, -0.1], [0.6, 0.2, -0.4]),
      assembled: pose([0, 0.54, 0]),
      window: [0.44, 0.6],
      ease: "power2.inOut",
      parallax: 0.8,
      secondary: { spin: 0.5 },
    },
    Tip: {
      exploded: pose([0.35, 1.25, 0.15], [0.2, 0.5, -0.5]),
      assembled: pose([0, 0.74, 0]),
      window: [0.56, 0.78],
      ease: "signature",
      parallax: 0.6,
      secondary: { spin: 0.3 },
    },
    // The cap does not go back on: it lands on the ground beside the pencil,
    // which is how a pencil is shown with its point.
    Cap: {
      exploded: pose([0.4, 0.95, -0.35], [-0.4, 0.6, 0.9]),
      assembled: pose([0.52, -0.66, 0.3], [0, 0.45, HALF_PI]),
      window: [0.72, 1],
      ease: "signature",
      parallax: 0.5,
      secondary: { spin: 0.2, settle: 0.01 },
    },
  },
};

export const SCENE: SceneConfig = {
  offset: [0, -0.2, 0],
  ground: -0.75,
  products: [CREAM, TINT, SHAMPOO, MASCARA, PENCIL],

  camera: {
    fov: 30,
    fovCompact: 36,
    // Wide enough to hold every cloud on a desktop; on a phone the frame
    // stays on the middle of the cluster and the edges are simply cropped.
    overview: { position: [0.2, 0.35, 9.6], target: [0, -0.62, 0] },
    overviewCompact: { position: [0.1, 0.1, 6.8], target: [0, -1.05, 0] },
    // The closing frame looks a little below the products so they ride up
    // and the copy takes the bottom of the screen.
    lineup: { position: [0.1, 0.3, 8.8], target: [0.05, -0.12, 0] },
    lineupCompact: { position: [0.05, 0.25, 8.0], target: [0, -0.62, 0] },
    lineupAt: 0.86,
    parallax: { x: 0.015, y: 0.01 },
    lerp: 0.12,
  },

  compactExplode: [0.55, 0.85, 0.8],

  idle: { float: 0.014, yaw: 0.018 },

  environment: {
    resolution: 256,
    resolutionCompact: 128,
  },

  shadow: { opacity: 0.6 },
};

/** Convenience for the copy: each product's window by id. */
export const WINDOWS: Readonly<Record<string, readonly [number, number]>> = Object.fromEntries(
  SCENE.products.map((product) => [product.id, product.window]),
);
