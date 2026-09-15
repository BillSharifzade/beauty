import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  DynamicDrawUsage,
  LatheGeometry,
  TorusGeometry,
  Vector2,
} from "three";

/**
 * The products, drawn as profiles.
 *
 * Every part of a bottle, jar, tube or pencil except the labels and the
 * shampoo's spout is a solid of revolution, so the parts are lathed from
 * hand-authored profiles: a profile is far easier to tune than a mesh, and a
 * lathe with eighty segments is a few thousand triangles.
 *
 * Every profile is authored in the assembled coordinate space of its product
 * (ground at y = -0.75) and then shifted onto its own pivot, because the rig
 * moves parts by their pivot and config/products.ts assumes the pivot is the
 * centre of the part. Parts that fill (liquid, cream) keep their pivot at
 * the bottom of the column so that scale.y is a fill level; multi-mesh parts
 * pass an explicit pivot so all their meshes share one centre.
 */

type Profile = readonly (readonly [number, number])[];

/**
 * A lathe of `profile`, with its pivot moved to `pivot`: the vertical centre
 * of the profile by default, the authored origin with "none", or a given y.
 */
export function lathe(profile: Profile, segments: number, pivot: "centre" | "none" | number = "centre"): LatheGeometry {
  let shiftY = 0;
  if (pivot === "centre") {
    let min = Infinity;
    let max = -Infinity;
    for (const point of profile) {
      if (point[1] < min) min = point[1];
      if (point[1] > max) max = point[1];
    }
    shiftY = -(min + max) / 2;
  } else if (typeof pivot === "number") {
    shiftY = -pivot;
  }
  const points = profile.map(([r, y]) => new Vector2(r, y + shiftY));
  const geometry = new LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
}

/** A cylinder along Y, centred; the workhorse for stems, discs and tubes. */
export function tube(rTop: number, rBottom: number, height: number, segments: number, open = false): CylinderGeometry {
  return new CylinderGeometry(rTop, rBottom, height, segments, 1, open);
}

/* ---- 03 · Shampoo ----------------------------------------------------------
 *
 * The outer wall only, from the base to the neck rim, rendered front-side.
 * A modelled inner wall looks worse: three's transmission is a screen-space
 * approximation, so every transmissive surface the eye looks through adds
 * its own specular layer, and a doubled wall means four of them stacked. */
const SHAMPOO_BODY: Profile = [
  [0.0, -0.75], [0.23, -0.75], [0.33, -0.744], [0.39, -0.72], [0.415, -0.682], [0.42, -0.64],
  [0.42, 0.4], [0.418, 0.452], [0.404, 0.506], [0.378, 0.554], [0.34, 0.596], [0.292, 0.628],
  [0.238, 0.646], [0.194, 0.652], [0.174, 0.66], [0.17, 0.676], [0.17, 0.75],
];

/* Local y = 0 is the floor of the liquid column; the last points give the
 * surface a meniscus so the top is not a machined disc. */
const SHAMPOO_LIQUID: Profile = [
  [0.0, 0.0], [0.196, 0.001], [0.298, 0.005], [0.358, 0.032], [0.383, 0.062], [0.388, 0.1],
  [0.388, 1.03], [0.387, 1.062], [0.38, 1.069], [0.33, 1.073], [0.2, 1.075], [0.0, 1.07],
];

const SHAMPOO_CAP: Profile = [
  [0.178, -0.11], [0.206, -0.11], [0.215, -0.096], [0.215, 0.084], [0.206, 0.104], [0.19, 0.11],
  [0.18, 0.11], [0.18, -0.106],
];

const PUMP_BASE: Profile = [
  [0.0, -0.045], [0.152, -0.045], [0.158, -0.034], [0.15, 0.012], [0.12, 0.038], [0.104, 0.045], [0.0, 0.045],
];

const PUMP_HEAD: Profile = [
  [0.0, -0.08], [0.108, -0.08], [0.115, -0.068], [0.115, 0.052], [0.108, 0.07], [0.09, 0.08], [0.0, 0.08],
];

/* The dip-tube foot: a stepped cage on the floor of the bottle, swallowed by
 * the liquid as it rises. */
const TUBE_FOOT: Profile = [
  [0.0, -0.08], [0.098, -0.08], [0.098, -0.048], [0.076, -0.026], [0.076, 0.056], [0.062, 0.08],
  [0.03, 0.08], [0.028, 0.05], [0.028, -0.04], [0.0, -0.04],
];

export const shampoo = {
  body: (s: number) => lathe(SHAMPOO_BODY, s, "none"),
  liquid: (s: number) => lathe(SHAMPOO_LIQUID, s, "none"),
  cap: (s: number) => lathe(SHAMPOO_CAP, s),
  pumpBase: (s: number) => lathe(PUMP_BASE, s),
  pumpHead: (s: number) => lathe(PUMP_HEAD, s),
  foot: (s: number) => lathe(TUBE_FOOT, Math.max(16, Math.round(s / 2))),
  dipTube: (s: number) => tube(0.022, 0.022, 1.4, Math.max(12, Math.round(s / 3))),
  spout: (s: number) => tube(0.046, 0.05, 0.2, Math.max(16, Math.round(s / 3))),
  nozzle: (s: number) => tube(0.034, 0.042, 0.05, Math.max(14, Math.round(s / 4)), true),
  /** The shoulder insert: a ring that stays above the fill line. */
  ring: (s: number) => {
    const ring = new TorusGeometry(0.3, 0.022, 10, Math.max(24, Math.round(s / 2)));
    ring.rotateX(Math.PI / 2);
    return ring;
  },
};

/* ---- 01 · Cream -----------------------------------------------------------
 * A squat, thick-walled jar. The outer shell runs up to the rim, turns in and
 * drops a short way down the inside, which is what the eye reads as thick
 * glass once the transmission's thickness is set to match. */
const JAR_BODY: Profile = [
  [0.0, -0.75], [0.26, -0.75], [0.36, -0.742], [0.4, -0.722], [0.415, -0.69], [0.42, -0.64],
  [0.42, -0.34], [0.418, -0.31], [0.41, -0.29], [0.395, -0.276], [0.375, -0.27], [0.35, -0.27],
  [0.345, -0.28], [0.345, -0.36],
];

/* Local y = 0 is the jar's floor. The top is a soft swirl rather than a disc. */
const CREAM_FILL: Profile = [
  [0.0, 0.0], [0.2, 0.002], [0.31, 0.01], [0.335, 0.03], [0.34, 0.06], [0.34, 0.32], [0.335, 0.34],
  [0.3, 0.352], [0.18, 0.362], [0.08, 0.372], [0.0, 0.375],
];

const LID: Profile = [
  [0.37, -0.29], [0.43, -0.29], [0.435, -0.27], [0.435, -0.15], [0.43, -0.125], [0.415, -0.108],
  [0.38, -0.098], [0.3, -0.092], [0.18, -0.089], [0.0, -0.088],
];

export const cream = {
  jar: (s: number) => lathe(JAR_BODY, s),
  fill: (s: number) => lathe(CREAM_FILL, s, "none"),
  disc: (s: number) => tube(0.34, 0.34, 0.012, s),
  lid: (s: number) => lathe(LID, s),
};

/* ---- 02 · Tint ------------------------------------------------------------ */
const TINT_BOTTLE: Profile = [
  [0.0, -0.75], [0.13, -0.75], [0.18, -0.74], [0.2, -0.71], [0.205, -0.66], [0.205, -0.25],
  [0.2, -0.2], [0.185, -0.165], [0.16, -0.14], [0.125, -0.125], [0.105, -0.12], [0.1, -0.11], [0.1, -0.05],
];

const TINT_LIQUID: Profile = [
  [0.0, 0.0], [0.12, 0.002], [0.165, 0.012], [0.175, 0.04], [0.175, 0.47], [0.17, 0.49], [0.12, 0.497], [0.0, 0.5],
];

const TINT_COLLAR: Profile = [
  [0.1, -0.12], [0.135, -0.12], [0.14, -0.1], [0.14, -0.06], [0.135, -0.05], [0.1, -0.05],
];

/* The doe-foot: a teardrop, flattened in z by the mesh that carries it. */
const TINT_TIP: Profile = [
  [0.0, -0.72], [0.03, -0.715], [0.05, -0.69], [0.052, -0.65], [0.04, -0.615], [0.02, -0.6], [0.0, -0.6],
];

const TINT_CAP: Profile = [
  [0.1, -0.06], [0.13, -0.06], [0.135, -0.04], [0.135, 0.44], [0.13, 0.47], [0.115, 0.49], [0.08, 0.5], [0.0, 0.5],
];

/** The wand's pivot: the centre of stem plus tip, shared by both meshes. */
export const TINT_WAND_PIVOT = -0.385;

export const tint = {
  bottle: (s: number) => lathe(TINT_BOTTLE, s),
  liquid: (s: number) => lathe(TINT_LIQUID, s, "none"),
  collar: (s: number) => lathe(TINT_COLLAR, Math.max(24, Math.round(s / 2))),
  stem: (s: number) => tube(0.017, 0.017, 0.55, Math.max(10, Math.round(s / 4))),
  tip: (s: number) => lathe(TINT_TIP, Math.max(20, Math.round(s / 2)), TINT_WAND_PIVOT),
  cap: (s: number) => lathe(TINT_CAP, s),
};

/* ---- 04 · Mascara --------------------------------------------------------- */
const MASCARA_TUBE: Profile = [
  [0.0, -0.75], [0.1, -0.75], [0.125, -0.74], [0.135, -0.71], [0.135, 0.12], [0.13, 0.15],
  [0.115, 0.165], [0.095, 0.17], [0.09, 0.18], [0.09, 0.26], [0.0, 0.26],
];

const MASCARA_COLLAR: Profile = [
  [0.09, 0.17], [0.14, 0.17], [0.145, 0.19], [0.145, 0.3], [0.14, 0.32], [0.09, 0.32],
];

const MASCARA_CAP: Profile = [
  [0.1, 0.31], [0.135, 0.31], [0.138, 0.34], [0.138, 0.92], [0.133, 0.965], [0.115, 0.99], [0.08, 1.005], [0.0, 1.01],
];

/** The wand's pivot: the centre of stem plus brush. */
export const MASCARA_WAND_PIVOT = -0.13;

/** Where the brush rows sit, in the wand's own space: 26 thin discs of two
 *  alternating radii, which at hero distance is what bristles look like. */
export const MASCARA_BRUSH_ROWS = 26;

export const mascara = {
  tube: (s: number) => lathe(MASCARA_TUBE, s),
  collar: (s: number) => lathe(MASCARA_COLLAR, Math.max(24, Math.round(s / 2))),
  cap: (s: number) => lathe(MASCARA_CAP, s),
  stem: (s: number) => tube(0.02, 0.02, 0.49, Math.max(10, Math.round(s / 4))),
  core: (s: number) => tube(0.012, 0.02, 0.45, Math.max(10, Math.round(s / 4))),
  /** Unit disc, scaled per instance. */
  bristle: () => tube(1, 1, 1, 18),
};

/* ---- 05 · Pencil ---------------------------------------------------------- */
const PENCIL_BODY: Profile = [
  [0.0, -0.75], [0.06, -0.75], [0.075, -0.735], [0.078, -0.7], [0.078, 0.55], [0.075, 0.58], [0.0, 0.58],
];

const PENCIL_RING: Profile = [
  [0.078, 0.5], [0.084, 0.5], [0.084, 0.58], [0.078, 0.58],
];

const PENCIL_WOOD: Profile = [
  [0.0, 0.58], [0.078, 0.58], [0.021, 0.815], [0.0, 0.815],
];

const PENCIL_CORE: Profile = [
  [0.0, 0.812], [0.021, 0.812], [0.0, 0.9],
];

const PENCIL_CAP: Profile = [
  [0.06, 0.0], [0.088, 0.0], [0.09, 0.03], [0.09, 0.44], [0.086, 0.47], [0.07, 0.49], [0.0, 0.495],
];

/** The tip's pivot: the centre of wood plus core. */
export const PENCIL_TIP_PIVOT = 0.74;

export const pencil = {
  body: (s: number) => lathe(PENCIL_BODY, Math.max(24, Math.round(s / 2))),
  ring: (s: number) => lathe(PENCIL_RING, Math.max(24, Math.round(s / 2))),
  wood: (s: number) => lathe(PENCIL_WOOD, Math.max(24, Math.round(s / 2)), PENCIL_TIP_PIVOT),
  core: (s: number) => lathe(PENCIL_CORE, Math.max(16, Math.round(s / 3)), PENCIL_TIP_PIVOT),
  cap: (s: number) => lathe(PENCIL_CAP, Math.max(24, Math.round(s / 2))),
};

/* ---- Labels ----------------------------------------------------------------
 *
 * A strip that has to be flat while it flies and wrapped once it lands, so it
 * cannot be a CylinderGeometry: the wrap is the animation. The geometry is a
 * grid whose positions are rewritten from a single bend parameter, chosen so
 * that a bend of zero degenerates smoothly into a flat plane instead of into
 * a division by zero.
 *
 * At bend b the strip is an arc of angle thetaLength * b whose arc length is
 * always the strip's width, so the printed artwork never stretches; at b = 1
 * the radius is exactly the wrap radius and the strip closes on the surface.
 */

export interface BendableStrip {
  geometry: BufferGeometry;
  /** Rewrites positions and normals for a bend in [0, 1]. Cheap: a few
   *  hundred vertices, and it returns early when the value has not moved. */
  setBend: (bend: number) => void;
}

export function createBendableStrip(
  radius: number,
  thetaLength: number,
  height: number,
  segX: number,
  segY: number,
): BendableStrip {
  const width = radius * thetaLength;
  const vertexCount = (segX + 1) * (segY + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  for (let iy = 0; iy <= segY; iy += 1) {
    for (let ix = 0; ix <= segX; ix += 1) {
      const i = iy * (segX + 1) + ix;
      uvs[i * 2] = ix / segX;
      uvs[i * 2 + 1] = 1 - iy / segY;
    }
  }
  for (let iy = 0; iy < segY; iy += 1) {
    for (let ix = 0; ix < segX; ix += 1) {
      const a = iy * (segX + 1) + ix;
      const b = a + 1;
      const c = a + segX + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  const positionAttr = new BufferAttribute(positions, 3);
  const normalAttr = new BufferAttribute(normals, 3);
  positionAttr.setUsage(DynamicDrawUsage);
  normalAttr.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("normal", normalAttr);
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  let current = -1;

  const setBend = (bendRaw: number) => {
    const bend = bendRaw < 0 ? 0 : bendRaw > 1 ? 1 : bendRaw;
    if (Math.abs(bend - current) < 1e-4) return;
    current = bend;

    const theta = thetaLength * bend;
    const flat = theta < 1e-3;
    const r = flat ? 0 : width / theta;

    for (let iy = 0; iy <= segY; iy += 1) {
      const y = height * (0.5 - iy / segY);
      for (let ix = 0; ix <= segX; ix += 1) {
        const u = ix / segX - 0.5;
        const i = (iy * (segX + 1) + ix) * 3;
        if (flat) {
          positions[i] = u * width;
          positions[i + 1] = y;
          positions[i + 2] = 0;
          normals[i] = 0;
          normals[i + 1] = 0;
          normals[i + 2] = 1;
        } else {
          const angle = u * theta;
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);
          positions[i] = r * sin;
          positions[i + 1] = y;
          positions[i + 2] = r * cos - r;
          normals[i] = sin;
          normals[i + 1] = 0;
          normals[i + 2] = cos;
        }
      }
    }
    positionAttr.needsUpdate = true;
    normalAttr.needsUpdate = true;
    geometry.computeBoundingSphere();
  };

  setBend(1);
  return { geometry, setBend };
}
