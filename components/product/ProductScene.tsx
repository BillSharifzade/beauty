"use client";

import { AdaptiveDpr, ContactShadows, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  Group,
  Material,
  Mesh,
  PerspectiveCamera,
  SpotLight,
  Vector3,
} from "three";
import { Collection } from "./Collection";
import { partKey, type PartSpec, type Pose, type ProductId, type SceneConfig, type Vec3 } from "./config/types";
import { clamp01, damp, EASES, lerp, smoothstep, windowT } from "./easing";
import { createHandles, type ProductHandles } from "./handles";
import { StudioEnvironment, StudioLights } from "./Lighting";
import type { ProgressStore } from "./ScrollController";

/**
 * The scene, and the one loop that drives it.
 *
 * Everything below is a pure function of the scroll progress evaluated once
 * per frame: thirty-two part transforms, five product yaws, the camera, four
 * light intensities, the ground shadow, the labels' wrap and the DOM copy.
 * No part subscribes to anything; nothing keeps its own state that could
 * drift out of step with the scroll. Scrubbing backwards is therefore free
 * and exact.
 */

/** The page's sticky bar covers the top of the pinned frame, so the fit below
 *  treats that strip as unusable rather than parking a cap behind it. */
const NAV_CLEARANCE_PX = 76;

export type StillView = ProductId | "lineup";

/** Which parts a camera key has to hold in frame: one product, all of them,
 *  or none (the authored key is obeyed literally). */
type FitSet = number | "all" | "none";

interface Key {
  at: number;
  position: Vector3;
  target: Vector3;
  fit: FitSet;
}

interface Segment {
  a: Key;
  b: Key;
  t: number;
}

/**
 * How far a part reaches from its own pivot, per direction. Asymmetric on
 * purpose: a symmetric half-size is wrong for anything whose pivot is not its
 * centre, and the fills' pivots are the bottoms of their columns by design.
 */
interface PartExtent {
  up: number;
  down: number;
  left: number;
  right: number;
  /** Nearest point to the camera, relative to the pivot. */
  front: number;
  measured: boolean;
}

interface PartEntry {
  key: string;
  product: number;
  spec: PartSpec;
  exploded: Pose;
}

const vec = (v: Vec3) => new Vector3(v[0], v[1], v[2]);

/* ---- Sampling helpers ---------------------------------------------------- */

function samplePairs(pairs: readonly (readonly [number, number])[], p: number): number {
  const first = pairs[0];
  const last = pairs[pairs.length - 1];
  if (!first || !last) return 0;
  if (p <= first[0]) return first[1];
  if (p >= last[0]) return last[1];
  for (let i = 0; i < pairs.length - 1; i += 1) {
    const a = pairs[i];
    const b = pairs[i + 1];
    if (!a || !b || p > b[0]) continue;
    return lerp(a[1], b[1], smoothstep((p - a[0]) / (b[0] - a[0] || 1)));
  }
  return last[1];
}

/** Smoothstep between keys, so the camera has no corners at the keyframes.
 *  Returns the segment so the fit can be blended across it too. */
function sampleKeys(keys: readonly Key[], p: number, outPos: Vector3, outTarget: Vector3): Segment {
  const first = keys[0]!;
  const last = keys[keys.length - 1]!;
  if (p <= first.at) {
    outPos.copy(first.position);
    outTarget.copy(first.target);
    return { a: first, b: first, t: 0 };
  }
  if (p >= last.at) {
    outPos.copy(last.position);
    outTarget.copy(last.target);
    return { a: last, b: last, t: 0 };
  }
  for (let i = 0; i < keys.length - 1; i += 1) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (p > b.at) continue;
    const t = smoothstep((p - a.at) / (b.at - a.at || 1));
    outPos.lerpVectors(a.position, b.position, t);
    outTarget.lerpVectors(a.target, b.target, t);
    return { a, b, t };
  }
  outPos.copy(last.position);
  outTarget.copy(last.target);
  return { a: last, b: last, t: 0 };
}

/**
 * The camera's path, derived from the products rather than authored by hand:
 * the opening overview, then for each product a shot at the start of its
 * window and a slightly closer one at its end, then the lineup. Between keys
 * the camera glides; inside a product's window it dollies in.
 */
function buildKeys(config: SceneConfig, compact: boolean): Key[] {
  const cam = config.camera;
  const offset = vec(config.offset);
  const overview = compact ? cam.overviewCompact : cam.overview;
  const lineup = compact ? cam.lineupCompact : cam.lineup;
  const keys: Key[] = [
    {
      at: 0,
      position: vec(overview.position),
      target: vec(overview.target),
      // A phone cannot hold five clouds side by side without making them
      // thumbnails, so it frames the middle and lets the edges crop.
      fit: compact ? "none" : "all",
    },
  ];
  config.products.forEach((product, i) => {
    const slot = vec(compact ? product.slotCompact : product.slot).add(offset);
    const [a, b] = product.window;
    const span = b - a;
    const target = slot.clone().add(vec(product.camera.target));
    keys.push({ at: a + span * 0.16, position: slot.clone().add(vec(product.camera.from)), target, fit: i });
    keys.push({
      at: b - span * 0.08,
      position: slot.clone().add(vec(product.camera.to)),
      target: target.clone(),
      fit: i,
    });
  });
  keys.push({ at: cam.lineupAt + 0.08, position: vec(lineup.position), target: vec(lineup.target), fit: "all" });
  keys.push({ at: 1, position: vec(lineup.position), target: vec(lineup.target), fit: "all" });
  return keys;
}

/** Exploded offsets shrink on narrow screens rather than the camera pulling
 *  back until the product is a thumbnail. */
function scaledPose(pose: Pose, factor: Vec3): Pose {
  return {
    position: [pose.position[0] * factor[0], pose.position[1] * factor[1], pose.position[2] * factor[2]],
    rotation: pose.rotation,
    scale: pose.scale,
  };
}

/* ---- The rig ------------------------------------------------------------- */

interface RigProps {
  config: SceneConfig;
  handles: ProductHandles;
  store: ProgressStore;
  compact: boolean;
  /** Reduced motion: the finished collection, held still. */
  still: boolean;
  /** A single authored frame for a still render: one product, or the lineup. */
  stillView: StillView | null;
  /** The sequence held at one progress value, for tuning and screenshots. */
  fixed: number | null;
  /** The studio is a black room by night and a white one by day. */
  dark: boolean;
}

function Rig({ config, handles, store, compact, still, stillView, fixed, dark }: RigProps) {
  const groupRef = useRef<Group>(null);
  const shadowRef = useRef<Group>(null);
  const shadowMaterial = useRef<Material | null>(null);

  const keyLight = useRef<DirectionalLight>(null);
  const fillLight = useRef<DirectionalLight>(null);
  const rimLight = useRef<SpotLight>(null);
  const accentLight = useRef<DirectionalLight>(null);

  const keys = useMemo(() => buildKeys(config, compact), [config, compact]);

  /* The still frame, when one was asked for: a product's closer shot, or the
   * closing lineup. */
  const stillKey = useMemo(() => {
    if (!stillView) return null;
    if (stillView === "lineup") return keys[keys.length - 1]!;
    const index = config.products.findIndex((product) => product.id === stillView);
    return keys[2 + index * 2] ?? keys[keys.length - 1]!;
  }, [config, keys, stillView]);

  /* Every part once, flattened, with its exploded pose already scaled for the
   * screen, so the frame loop walks one array instead of five objects. */
  const parts = useMemo<PartEntry[]>(() => {
    const factor: Vec3 = compact ? config.compactExplode : [1, 1, 1];
    const list: PartEntry[] = [];
    config.products.forEach((product, index) => {
      for (const [name, spec] of Object.entries(product.parts)) {
        list.push({ key: partKey(product.id, name), product: index, spec, exploded: scaledPose(spec.exploded, factor) });
      }
    });
    return list;
  }, [config, compact]);

  const extents = useRef(new Map<string, PartExtent>());
  const box = useRef(new Box3());
  const worldPos = useRef(new Vector3());
  const locals = useRef<number[]>(config.products.map(() => 0));

  const smoothed = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const mouseSmooth = useRef({ x: 0, y: 0 });
  const camPos = useRef(keys[0]!.position.clone());
  const camTarget = useRef(keys[0]!.target.clone());
  const wantPos = useRef(new Vector3());
  const wantTarget = useRef(new Vector3());
  const dir = useRef(new Vector3());

  useEffect(() => {
    if (compact || still) return undefined;
    const onMove = (event: PointerEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [compact, still]);

  useEffect(() => {
    shadowRef.current?.traverse((object) => {
      if (object instanceof Mesh && !Array.isArray(object.material)) {
        shadowMaterial.current = object.material;
      }
    });
  }, []);

  /**
   * How far back the camera has to stand for `target` to hold every part in
   * `set`, measured rather than estimated: the parts have just been placed,
   * so one matrix update gives their real world positions and their real
   * bounding boxes give their real sizes. That is what makes a 1440-wide
   * desktop, a 1366×768 laptop and a 390-wide phone all safe without three
   * sets of hand-tuned camera keys.
   */
  const needed = (set: FitSet, target: Vector3, tan: number, aspect: number, topUsable: number): number => {
    if (set === "none") return 0;
    let reach = 0;
    for (const entry of parts) {
      if (set !== "all" && entry.product !== set) continue;
      const object = handles.parts.get(entry.key);
      if (!object || !object.visible) continue;
      object.getWorldPosition(worldPos.current);

      // Re-measured while the part is still moving, because a tube lying at
      // an angle is wider than the same tube standing up, and cached once it
      // has landed and its shape has stopped changing.
      let extent = extents.current.get(entry.key);
      if (!extent) {
        extent = { up: 0, down: 0, left: 0, right: 0, front: 0, measured: false };
        extents.current.set(entry.key, extent);
      }
      const local = locals.current[entry.product] ?? 0;
      if (!extent.measured || local <= entry.spec.window[1]) {
        box.current.setFromObject(object);
        if (box.current.isEmpty()) continue;
        extent.up = box.current.max.y - worldPos.current.y;
        extent.down = worldPos.current.y - box.current.min.y;
        extent.left = worldPos.current.x - box.current.min.x;
        extent.right = box.current.max.x - worldPos.current.x;
        extent.front = box.current.max.z - worldPos.current.z;
        extent.measured = true;
      }

      const dx = worldPos.current.x - target.x;
      const dy = worldPos.current.y - target.y;
      const halfY = Math.max((dy + extent.up) / topUsable, extent.down - dy, 0);
      const halfX = Math.max(dx + extent.right, extent.left - dx, 0);
      // Depth matters: a part in front of the product needs more room than
      // the same part beside it, so the reach is measured to its near face.
      const r =
        Math.max(halfY / tan, halfX / (tan * aspect)) * 1.05 + (worldPos.current.z - target.z) + extent.front;
      if (r > reach) reach = r;
    }
    return reach;
  };

  useFrame((state, rawDelta) => {
    // A tab that was in the background hands back a delta of several seconds;
    // clamping it stops the first frame after that from being a jump cut.
    const delta = Math.min(rawDelta, 0.1);
    const time = state.clock.elapsedTime;
    const camera = state.camera as PerspectiveCamera;
    const size = state.size;

    const frozen = still || stillView !== null;
    if (frozen) smoothed.current = 1;
    else if (fixed !== null) smoothed.current = fixed;
    else smoothed.current += (store.raw - smoothed.current) * damp(config.camera.lerp, delta);
    const p = smoothed.current;
    store.emit(p);

    const idle = frozen ? 0 : smoothstep(clamp01((p - 0.9) / 0.1));

    /* ---- The collection as a whole -------------------------------------- */
    const group = groupRef.current;
    if (group) {
      group.position.set(
        config.offset[0],
        config.offset[1] + idle * config.idle.float * Math.sin(time * 0.6),
        config.offset[2],
      );
    }

    /* ---- Each product's place and turn ---------------------------------- */
    config.products.forEach((product, i) => {
      const local = frozen ? 1 : clamp01((p - product.window[0]) / (product.window[1] - product.window[0]));
      locals.current[i] = local;
      const node = handles.products.get(product.id);
      if (!node) return;
      const slot = compact ? product.slotCompact : product.slot;
      node.position.set(slot[0], slot[1], slot[2]);
      // Products bob out of step with each other at the end; a row nodding
      // in unison is a music box.
      node.rotation.y = samplePairs(product.yaw, local) + idle * config.idle.yaw * Math.sin(time * 0.35 + i * 0.9);
    });

    /* ---- The parts ------------------------------------------------------ */
    let phase = 0;
    for (const entry of parts) {
      const object = handles.parts.get(entry.key);
      const { spec } = entry;
      const local = locals.current[entry.product] ?? 0;
      phase += 1.7;
      if (!object) continue;

      const from = entry.exploded;
      const to = spec.assembled;
      const raw = clamp01((local - spec.window[0]) / (spec.window[1] - spec.window[0] || 1));
      const t = EASES[spec.ease](raw);

      let px = lerp(from.position[0], to.position[0], t);
      let py = lerp(from.position[1], to.position[1], t);
      let pz = lerp(from.position[2], to.position[2], t);
      let rx = lerp(from.rotation[0], to.rotation[0], t);
      let ry = lerp(from.rotation[1], to.rotation[1], t);
      let rz = lerp(from.rotation[2], to.rotation[2], t);
      const sx = lerp(from.scale[0], to.scale[0], t);
      let sy = lerp(from.scale[1], to.scale[1], t);
      const sz = lerp(from.scale[2], to.scale[2], t);

      // Idle drift belongs to the exploded stage only; once a product starts
      // assembling, a part that is still wandering reads as a bug rather
      // than as weightlessness.
      const drift = frozen ? 0 : 1 - clamp01(local / 0.15);
      if (drift > 0 && spec.parallax > 0) {
        const amount = spec.parallax * drift;
        px += Math.sin(time * 0.42 + phase) * 0.035 * amount;
        py += Math.sin(time * 0.33 + phase * 1.7) * 0.045 * amount;
        pz += Math.sin(time * 0.28 + phase * 2.3) * 0.03 * amount;
        rz += Math.sin(time * 0.25 + phase) * 0.05 * amount;
      }

      const secondary = spec.secondary;
      if (secondary && !frozen) {
        if (secondary.spin) ry += secondary.spin * Math.sin(Math.PI * raw);
        if (secondary.sway) rz += secondary.sway * Math.sin(raw * Math.PI * 2.6) * (1 - raw);
        if (secondary.settle) {
          const s = clamp01((local - spec.window[1]) / 0.05);
          if (s > 0 && s < 1) py += secondary.settle * Math.sin(s * Math.PI * 2) * (1 - s);
        }
        if (secondary.drift) {
          ry += time * secondary.drift.yaw;
          rz += Math.sin(time * 0.8) * secondary.drift.roll;
        }
      }

      if (spec.fill) {
        const fill = windowT(local, spec.fill[0], spec.fill[1], EASES["power2.out"]);
        sy *= fill;
        object.visible = fill > 0.002;
      }

      object.position.set(px, py, pz);
      object.rotation.set(rx, ry, rz);
      object.scale.set(sx, sy, sz);

      if (spec.bend) {
        handles.deformers.get(entry.key)?.(windowT(local, spec.bend[0], spec.bend[1], EASES["power2.out"]));
      }
    }

    /* ---- The camera ----------------------------------------------------- */
    const fov = compact ? config.camera.fovCompact : config.camera.fov;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const tan = Math.tan((fov * Math.PI) / 360);
    const aspect = size.height > 0 ? size.width / size.height : 1;
    const topUsable = Math.max(0.45, 1 - (2 * NAV_CLEARANCE_PX) / Math.max(1, size.height));

    let fitA: FitSet = "none";
    let fitB: FitSet = "none";
    let blend = 0;
    if (stillKey) {
      wantPos.current.copy(stillKey.position);
      wantTarget.current.copy(stillKey.target);
      fitA = stillKey.fit;
      fitB = stillKey.fit;
    } else {
      const segment = sampleKeys(keys, p, wantPos.current, wantTarget.current);
      fitA = segment.a.fit;
      fitB = segment.b.fit;
      blend = segment.t;
    }

    // Fit: the distance that holds every part of the shot, blended across a
    // transition so that handing over from one product to the next does not
    // step the camera.
    if (group && (fitA !== "none" || fitB !== "none")) {
      group.updateMatrixWorld(true);
      const a = needed(fitA, wantTarget.current, tan, aspect, topUsable);
      const b = fitB === fitA ? a : needed(fitB, wantTarget.current, tan, aspect, topUsable);
      const required = lerp(a, b, blend);
      dir.current.subVectors(wantPos.current, wantTarget.current);
      const distance = dir.current.length();
      if (distance > 0 && required > distance) {
        wantPos.current.copy(wantTarget.current).addScaledVector(dir.current, required / distance);
      }
    }

    if (frozen || fixed !== null) {
      camPos.current.copy(wantPos.current);
      camTarget.current.copy(wantTarget.current);
    } else {
      const k = damp(config.camera.lerp, delta);
      camPos.current.lerp(wantPos.current, k);
      camTarget.current.lerp(wantTarget.current, k);
    }

    camera.position.copy(camPos.current);
    camera.lookAt(camTarget.current);

    if (!frozen && !compact) {
      const k = damp(0.08, delta);
      mouseSmooth.current.x += (mouse.current.x - mouseSmooth.current.x) * k;
      mouseSmooth.current.y += (mouse.current.y - mouseSmooth.current.y) * k;
      camera.rotation.y += mouseSmooth.current.x * config.camera.parallax.x;
      camera.rotation.x += mouseSmooth.current.y * config.camera.parallax.y;
    }

    /* ---- Light, and the ground ------------------------------------------ */
    const at = config.camera.lineupAt;
    const hero = smoothstep(clamp01((p - at + 0.04) / 0.16));
    if (keyLight.current) keyLight.current.intensity = 1.9 + hero * 0.5;
    if (fillLight.current) fillLight.current.intensity = 0.6 - hero * 0.12;
    // The rim arriving is the moment the sequence stops being an exploded
    // diagram and becomes a product shot.
    if (rimLight.current) rimLight.current.intensity = windowT(p, at - 0.04, at + 0.1, EASES["power2.out"]) * 3.4;
    if (accentLight.current) accentLight.current.intensity = windowT(p, at, at + 0.14, EASES["power2.out"]) * 0.55;
    if (shadowMaterial.current) {
      shadowMaterial.current.opacity =
        windowT(p, 0.02, 0.12, EASES["power2.out"]) * config.shadow.opacity * (dark ? 1 : 0.78);
    }
  });

  return (
    <>
      <StudioLights keyRef={keyLight} fillRef={fillLight} rimRef={rimLight} accentRef={accentLight} compact={compact} />
      <group ref={groupRef}>
        <Collection handles={handles} compact={compact} />
      </group>
      <ContactShadows
        ref={shadowRef}
        position={[0, config.ground + config.offset[1], 0]}
        scale={compact ? [6, 4] : [11, 5]}
        blur={compact ? 2.0 : 2.4}
        far={2.4}
        opacity={0}
        resolution={compact ? 256 : 512}
        color="#000000"
      />
    </>
  );
}

/** A frozen scene draws only on demand, and some of what it shows arrives
 *  late: the environment bakes, the fonts land, the mark loads. A few frames
 *  spread over the first seconds catch all of it. */
function StillTicker() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const timers = [120, 400, 900, 1800, 3000, 4500].map((ms) => window.setTimeout(invalidate, ms));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [invalidate]);
  return null;
}

/** Exposure follows the theme: a touch brighter in the black room. */
function Exposure({ dark }: { dark: boolean }) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    gl.toneMappingExposure = dark ? 1.05 : 1.0;
    invalidate();
  }, [gl, dark, invalidate]);
  return null;
}

/** Reports the scene as ready once frames are actually reaching the screen,
 *  rather than once React thinks it has mounted. In demand mode it asks for
 *  the frames it needs, since nothing else will. */
function ReadyProbe({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame((state) => {
    frames.current += 1;
    if (frames.current < 3) state.invalidate();
    else if (frames.current === 3) onReady();
  });
  return null;
}

export function ProductScene({
  config,
  store,
  compact,
  still,
  stillView,
  fixed = null,
  active,
  dark,
  onReady,
}: {
  config: SceneConfig;
  store: ProgressStore;
  compact: boolean;
  still: boolean;
  stillView: StillView | null;
  fixed?: number | null;
  dark: boolean;
  /** False while the section is off screen: the loop stops drawing frames
   *  nobody can see. */
  active: boolean;
  onReady: () => void;
}) {
  const handles = useMemo(() => createHandles(), []);
  const frozen = still || stillView !== null || fixed !== null;

  return (
    <Canvas
      dpr={compact ? [1, 1.25] : [1, 1.6]}
      // A still frame has nothing to keep redrawing, and neither has a
      // section that has scrolled away: demand renders on change and then
      // leaves the GPU alone.
      frameloop={active && !frozen ? "always" : "demand"}
      camera={{
        fov: compact ? config.camera.fovCompact : config.camera.fov,
        position: [0, 0, 9],
        near: 0.1,
        far: 60,
      }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = dark ? 1.05 : 1.0;
        // What the glass refracts is a second render of the scene. Half the
        // resolution on a phone halves the cost of the one expensive material
        // in the scene, and at that size nobody can see the difference.
        gl.transmissionResolutionScale = compact ? 0.5 : 1;
      }}
      shadows={!compact}
    >
      <Suspense fallback={null}>
        <StudioEnvironment config={config} compact={compact} />
        <Rig
          config={config}
          handles={handles}
          store={store}
          compact={compact}
          still={still}
          stillView={stillView}
          fixed={fixed}
          dark={dark}
        />
      </Suspense>
      <PerformanceMonitor />
      <AdaptiveDpr />
      <Exposure dark={dark} />
      {frozen && <StillTicker />}
      <ReadyProbe onReady={onReady} />
    </Canvas>
  );
}
