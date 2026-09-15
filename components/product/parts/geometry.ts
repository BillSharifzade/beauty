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
 * The bottle, drawn as profiles.
 *
 * There is no GLB in the repository yet, and a grey box standing in for a
 * premium bottle would be worse than nothing on a landing page, so the parts
 * are lathed from hand-authored profiles. A lathe is the right tool anyway:
 * every part of a pump bottle except the label and the spout is a solid of
 * revolution, and a profile is far easier to tune than a mesh.
 *
 * Every profile is authored in the assembled coordinate space and then
 * recentred on its own origin, because the rig moves parts by their pivot and
 * the config assumes the pivot is the centre of the part. The one exception is
 * Liquid, whose pivot sits at the bottom of the liquid column so that scale.y
 * is a fill level; that exception is documented in the README because a real
 * GLB has to reproduce it.
 */

type Profile = readonly (readonly [number, number])[];

function lathe(profile: Profile, segments: number, centreY = true): LatheGeometry {
  let shiftY = 0;
  if (centreY) {
    let min = Infinity;
    let max = -Infinity;
    for (const point of profile) {
      if (point[1] < min) min = point[1];
      if (point[1] > max) max = point[1];
    }
    shiftY = -(min + max) / 2;
  }
  const points = profile.map(([r, y]) => new Vector2(r, y + shiftY));
  const geometry = new LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
}

/* The outer wall only, from the base to the neck rim, rendered front-side.
 *
 * A modelled inner wall is the more literal thing to do and it looks worse:
 * three's transmission is a screen-space approximation, so every transmissive
 * surface the eye looks through adds its own specular layer, and a doubled
 * wall means four of them stacked. The bottle comes out uniformly milky. One
 * front-facing shell with a thickness value gives the refraction without the
 * pile-up, and it halves the triangles.
 *
 * The straight wall runs to y = 0.40 and the shoulder is kept short, because a
 * long shoulder turns a bottle into a bullet: the silhouette has to have a neck
 * the closure could plausibly grip. */
const BODY: Profile = [
  [0.0, -0.75],
  [0.23, -0.75],
  [0.33, -0.744],
  [0.39, -0.72],
  [0.415, -0.682],
  [0.42, -0.64],
  [0.42, 0.4],
  [0.418, 0.452],
  [0.404, 0.506],
  [0.378, 0.554],
  [0.34, 0.596],
  [0.292, 0.628],
  [0.238, 0.646],
  [0.194, 0.652],
  [0.174, 0.66],
  [0.17, 0.676],
  [0.17, 0.75],
];

/* Local y = 0 is the floor of the liquid column; the last points give the
 * surface a meniscus so the top is not a machined disc. */
const LIQUID: Profile = [
  [0.0, 0.0],
  [0.196, 0.001],
  [0.298, 0.005],
  [0.358, 0.032],
  [0.383, 0.062],
  [0.388, 0.1],
  [0.388, 1.03],
  [0.387, 1.062],
  [0.38, 1.069],
  [0.33, 1.073],
  [0.2, 1.075],
  [0.0, 1.07],
];

const CAP: Profile = [
  [0.178, -0.11],
  [0.206, -0.11],
  [0.215, -0.096],
  [0.215, 0.084],
  [0.206, 0.104],
  [0.19, 0.11],
  [0.18, 0.11],
  [0.18, -0.106],
];

const PUMP_BASE: Profile = [
  [0.0, -0.045],
  [0.152, -0.045],
  [0.158, -0.034],
  [0.15, 0.012],
  [0.12, 0.038],
  [0.104, 0.045],
  [0.0, 0.045],
];

const PUMP_HEAD: Profile = [
  [0.0, -0.08],
  [0.108, -0.08],
  [0.115, -0.068],
  [0.115, 0.052],
  [0.108, 0.07],
  [0.09, 0.08],
  [0.0, 0.08],
];

/* The dip-tube foot: a stepped cage that sits on the floor of the bottle and
 * is swallowed by the liquid as it rises, which is the point of assembling it
 * before the fill rather than after. */
const TUBE_FOOT: Profile = [
  [0.0, -0.08],
  [0.098, -0.08],
  [0.098, -0.048],
  [0.076, -0.026],
  [0.076, 0.056],
  [0.062, 0.08],
  [0.03, 0.08],
  [0.028, 0.05],
  [0.028, -0.04],
  [0.0, -0.04],
];

export function bottleBodyGeometry(segments: number): LatheGeometry {
  return lathe(BODY, segments, false);
}

/** Anchored at the bottom of the column: scale.y is the fill level. */
export function liquidGeometry(segments: number): LatheGeometry {
  return lathe(LIQUID, segments, false);
}

export function capGeometry(segments: number): LatheGeometry {
  return lathe(CAP, segments);
}

export function pumpBaseGeometry(segments: number): LatheGeometry {
  return lathe(PUMP_BASE, segments);
}

export function pumpHeadGeometry(segments: number): LatheGeometry {
  return lathe(PUMP_HEAD, segments);
}

export function tubeFootGeometry(segments: number): LatheGeometry {
  return lathe(TUBE_FOOT, Math.max(16, Math.round(segments / 2)));
}

export function dipTubeGeometry(segments: number): CylinderGeometry {
  return new CylinderGeometry(0.022, 0.022, 1.4, Math.max(12, Math.round(segments / 3)), 1, false);
}

export function spoutGeometry(segments: number): CylinderGeometry {
  return new CylinderGeometry(0.046, 0.05, 0.2, Math.max(16, Math.round(segments / 3)), 1, false);
}

export function nozzleGeometry(segments: number): CylinderGeometry {
  return new CylinderGeometry(0.034, 0.042, 0.05, Math.max(14, Math.round(segments / 4)), 1, true);
}

/** The shoulder insert: a ring that stays above the fill line, so at least one
 *  internal component is still visible through the glass in the hero shot. */
export function shoulderRingGeometry(segments: number): TorusGeometry {
  const ring = new TorusGeometry(0.3, 0.022, 10, Math.max(24, Math.round(segments / 2)));
  ring.rotateX(Math.PI / 2);
  return ring;
}

/* ---- The label ----------------------------------------------------------
 *
 * A strip that has to be flat while it flies and wrapped once it lands, so it
 * cannot be a CylinderGeometry: the wrap is the animation. The geometry is a
 * grid whose positions are rewritten from a single bend parameter, and the
 * parameterisation is chosen so that a bend of zero degenerates smoothly into
 * a flat plane instead of into a division by zero.
 *
 * At bend b the strip is an arc of angle thetaLength * b whose arc length is
 * always the strip's width, so the printed artwork never stretches; at b = 1
 * the radius is exactly the wrap radius and the strip closes on the glass.
 */

export interface BendableStrip {
  geometry: BufferGeometry;
  /** Rewrites positions and normals for a bend in [0, 1]. Cheap: a few hundred
   *  vertices, and it returns early when the value has not actually moved. */
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
    // Below this the arc is indistinguishable from a plane and the radius
    // blows up, so draw the plane instead.
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
