import type { ProductConfig, Vec3 } from "./types";

/**
 * The Hayat Beauty shampoo, taken apart.
 *
 * Coordinates are model units, roughly decimetres: the assembled bottle stands
 * from y = -0.75 (its base) to y = 1.21 (the top of the actuator), so the
 * ground plane is at -0.75 and the whole thing is lifted by `offset` until its
 * mass sits on the optical centre.
 *
 * Two rules held the exploded numbers in place, and both are about the frame
 * rather than about the look:
 *
 * 1. Nothing leaves the viewport at progress 0. At the opening framing the
 *    camera sees roughly ±1.42 vertically and ±2.2 horizontally on a desktop,
 *    ±0.8 horizontally on a phone — hence `compactExplode`, which pulls the
 *    sideways scatter in to 40% on narrow screens rather than pulling the
 *    camera back until the product is a thumbnail.
 *
 * 2. The windows follow the stage list, not convenience: body and inner parts
 *    25–40%, liquid rising 28–46%, label 40–57%, tube/closure/pump 55–79%.
 *    Parts that meet mechanically overlap slightly so the fit reads as one
 *    movement instead of a queue.
 */

const V0: Vec3 = [0, 0, 0];
const ONE: Vec3 = [1, 1, 1];

/** Radius the label and the logo wrap at: bottle wall plus the thickness of a
 *  printed film. The label geometry derives its arc length from this, so the
 *  wrap closes exactly on the glass instead of hovering or sinking into it. */
export const WRAP_RADIUS = 0.4235;

export const SHAMPOO: ProductConfig = {
  offset: [0, -0.23, 0],

  // Engineering view first, then a slow turn into the hero three-quarter.
  yaw: [
    [0, -0.3],
    [0.68, 0],
    [0.82, 0.1],
    [0.92, 0.22],
    [1, 0.22],
  ],

  camera: {
    fov: 30,
    fovCompact: 30,
    keys: [
      { at: 0, position: [0.35, 0.25, 5.3], target: [0, 0.05, 0] },
      // 30%: close enough to read the glass and the liquid as materials.
      { at: 0.3, position: [0.16, 0.1, 4.85], target: [0, 0, 0] },
      // 50%: the label, square on.
      { at: 0.5, position: [0, 0.04, 4.7], target: [0, 0.06, 0] },
      // 65%: up to the dispenser while it seats.
      { at: 0.65, position: [-0.1, 0.44, 4.82], target: [0, 0.36, 0] },
      { at: 0.82, position: [0, 0.1, 5.0], target: [0, 0.02, 0] },
      { at: 0.92, position: [0, 0.08, 4.5], target: [0, 0.02, 0] },
      // The closing frame looks left of the bottle, which slides the product
      // off centre and opens the left half for the copy. Only as far off as
      // the copy needs: a product pushed to the edge reads as an afterthought.
      { at: 1, position: [0, 0.08, 4.5], target: [-0.38, 0.02, 0] },
    ],
    keysCompact: [
      { at: 0, position: [0.3, 0.3, 7.9], target: [0, 0.1, 0] },
      { at: 0.3, position: [0.12, 0.1, 7.5], target: [0, 0, 0] },
      { at: 0.5, position: [0, 0.05, 7.3], target: [0, 0.06, 0] },
      { at: 0.65, position: [0, 0.5, 7.4], target: [0, 0.4, 0] },
      { at: 0.82, position: [0, 0.1, 7.7], target: [0, 0.02, 0] },
      { at: 0.92, position: [0, 0.1, 7.3], target: [0, 0.02, 0] },
      // Portrait has no left half to give away, so the product rides up and
      // the copy takes the bottom of the screen instead. The lift stops short
      // of the top: the actuator has to clear the page's sticky bar.
      { at: 1, position: [0, 0.1, 7.3], target: [0, -0.6, 0] },
    ],
    parallax: { x: 0.015, y: 0.01 },
    lerp: 0.12,
    // Everything in frame while parts are flying; the 65% look at the pump is
    // a detail shot and is allowed to cut the base off; the hero is whole.
    fit: [
      [0, 1],
      [0.6, 1],
      [0.66, 0],
      [0.78, 0],
      [0.86, 1],
      [1, 1],
    ],
  },

  // Narrow screens get a tighter scatter, but not so tight that the exploded
  // view becomes a pile: the camera's own fit check pulls back to hold
  // whatever this produces, so the number can be generous.
  compactExplode: [0.46, 0.85, 0.8],

  idle: { float: 0.014, yaw: 0.022 },

  environment: {
    // Drop a .hdr into public/hdri and name it here to replace the built-in
    // softbox rig with a measured probe. See components/product/README.md.
    hdr: null,
    resolution: 256,
    resolutionCompact: 128,
  },

  model: {
    // Set this to "/models/shampoo.glb" once a real model exists; the
    // procedural bottle stays as the fallback if the file fails to load.
    glb: null,
    draco: "/draco/",
  },

  shadow: { y: -0.752, opacity: 0.62, window: [0.5, 0.86] },

  parts: {
    // ---- 10–34%: the body arrives first and everything else references it ---
    Bottle_Body: {
      exploded: { position: [0.05, -0.18, 0.4], rotation: [0.1, -0.55, 0.06], scale: ONE },
      assembled: { position: V0, rotation: V0, scale: ONE },
      window: [0.1, 0.34],
      ease: "signature",
      parallax: 0.35,
      secondary: { spin: 0.12 },
    },

    // ---- 25–40%: the internals, one before the liquid hides it -------------
    Inner_Component_01: {
      exploded: { position: [-0.95, -0.8, -0.5], rotation: [0.6, 0.9, -0.4], scale: ONE },
      assembled: { position: [0, -0.56, 0], rotation: V0, scale: ONE },
      window: [0.24, 0.38],
      ease: "power2.inOut",
      parallax: 0.9,
      secondary: { spin: 0.5, sway: 0.08 },
    },
    Inner_Component_02: {
      exploded: { position: [0.9, -0.55, -0.75], rotation: [-0.7, 0.4, 0.5], scale: ONE },
      assembled: { position: [0, 0.5, 0], rotation: V0, scale: ONE },
      window: [0.26, 0.4],
      ease: "power2.inOut",
      parallax: 0.8,
      secondary: { spin: 0.4 },
    },

    // ---- 28–46%: the liquid rises from the base and fills the volume -------
    // It does not fly: its geometry is anchored at the bottom of the liquid
    // column, so scale.y is literally a fill level. Thick shampoo is opaque,
    // which is also why it reads through the glass at all — a transparent
    // liquid would fall out of the renderer's transmission pass.
    Liquid: {
      exploded: { position: [0, -0.714, 0], rotation: V0, scale: ONE },
      assembled: { position: [0, -0.714, 0], rotation: V0, scale: ONE },
      window: [0.28, 0.46],
      fill: [0.28, 0.46],
      ease: "power2.out",
      parallax: 0,
      secondary: { drift: { yaw: 0.05, roll: 0.007 } },
    },

    // ---- 40–57%: the label aligns, closes in and wraps ---------------------
    // The label is the widest thing in the scene while it is still flat — a
    // full unit across — so it is also the part the frame has the least room
    // for. It starts nearer the middle and less far forward than the rest;
    // depth magnifies, and a magnified strip is what pushes the camera back.
    Label: {
      exploded: { position: [1.1, -0.3, 0.62], rotation: [0.15, -0.75, 0.22], scale: ONE },
      assembled: { position: [0, 0.1, WRAP_RADIUS], rotation: V0, scale: ONE },
      window: [0.4, 0.57],
      bend: [0.44, 0.57],
      ease: "signature",
      parallax: 1,
      secondary: { sway: 0.06 },
    },
    Logo: {
      exploded: { position: [0.8, 0.6, 1.15], rotation: [-0.3, 0.6, -0.5], scale: ONE },
      assembled: { position: [0, -0.4, WRAP_RADIUS + 0.009], rotation: V0, scale: ONE },
      window: [0.46, 0.6],
      ease: "power3.out",
      parallax: 1.1,
    },

    // ---- 55–79%: tube, closure, pump. Mechanical, and slowest at the fit ----
    Pump_Tube: {
      exploded: { position: [0.88, 0.22, -0.4], rotation: [0, 0, 0.55], scale: ONE },
      assembled: { position: [0, 0.05, 0], rotation: V0, scale: ONE },
      window: [0.55, 0.66],
      ease: "signature",
      parallax: 0.7,
      secondary: { sway: 0.1 },
    },
    Cap: {
      exploded: { position: [0.15, 1.2, -0.3], rotation: [-0.25, 0.8, 0.15], scale: ONE },
      assembled: { position: [0, 0.85, 0], rotation: V0, scale: ONE },
      window: [0.58, 0.7],
      ease: "signature",
      parallax: 0.5,
      secondary: { spin: 0.35, settle: 0.012 },
    },
    Pump_Base: {
      exploded: { position: [-0.8, 1.05, 0.55], rotation: [0.3, -0.6, -0.25], scale: ONE },
      assembled: { position: [0, 1.005, 0], rotation: V0, scale: ONE },
      window: [0.62, 0.74],
      ease: "signature",
      parallax: 0.6,
      secondary: { spin: 0.28 },
    },
    Pump_Head: {
      exploded: { position: [-0.25, 1.55, 0.2], rotation: [0.2, 1.1, 0.18], scale: ONE },
      assembled: { position: [0, 1.13, 0], rotation: V0, scale: ONE },
      window: [0.66, 0.79],
      ease: "power2.inOut",
      parallax: 0.55,
      secondary: { settle: 0.018 },
    },
  },
};
