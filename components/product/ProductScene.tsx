"use client";

import { AdaptiveDpr, ContactShadows, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  Group,
  Material,
  Mesh,
  SpotLight,
  Vector3,
} from "three";
import { PART_KEYS, type CameraKey, type PartKey, type Pose, type ProductConfig } from "./config/types";
import { clamp01, damp, EASES, lerp, smoothstep, windowT } from "./easing";
import type { ProductHandles } from "./handles";
import { createHandles } from "./handles";
import { StudioEnvironment, StudioLights } from "./Lighting";
import { ProductModel } from "./ProductModel";
import type { ProgressStore } from "./ScrollController";

/**
 * The scene, and the one loop that drives it.
 *
 * Everything below is a pure function of the scroll progress evaluated once
 * per frame: part transforms, the camera, four light intensities, the ground
 * shadow, the label's wrap and the DOM copy. No part subscribes to anything;
 * nothing keeps its own state that could drift out of step with the scroll.
 * Scrubbing backwards is therefore free and exact.
 */

/** The page's sticky bar covers the top of the pinned frame, so the fit below
 *  treats that strip as unusable rather than parking the actuator behind it. */
const NAV_CLEARANCE_PX = 76;

/**
 * How far a part reaches from its own pivot, per direction.
 *
 * Asymmetric on purpose. A symmetric half-size is wrong for anything whose
 * pivot is not its centre, and the liquid's pivot is the bottom of its column
 * by design — treating its height as a radius makes the camera reserve a
 * bottle's worth of empty space under the bottle and pull back to hold it.
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

/* ---- Sampling helpers ---------------------------------------------------- */

function sampleKeys(keys: readonly CameraKey[], p: number, outPos: Vector3, outTarget: Vector3) {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (!first || !last) return;
  if (p <= first.at) {
    outPos.set(...first.position);
    outTarget.set(...first.target);
    return;
  }
  if (p >= last.at) {
    outPos.set(...last.position);
    outTarget.set(...last.target);
    return;
  }
  for (let i = 0; i < keys.length - 1; i += 1) {
    const a = keys[i];
    const b = keys[i + 1];
    if (!a || !b || p > b.at) continue;
    // Smoothstep between keys, so the camera has no corners at the keyframes.
    const t = smoothstep((p - a.at) / (b.at - a.at || 1));
    outPos.set(
      lerp(a.position[0], b.position[0], t),
      lerp(a.position[1], b.position[1], t),
      lerp(a.position[2], b.position[2], t),
    );
    outTarget.set(
      lerp(a.target[0], b.target[0], t),
      lerp(a.target[1], b.target[1], t),
      lerp(a.target[2], b.target[2], t),
    );
    return;
  }
}

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

/** Exploded offsets shrink on narrow screens rather than the camera pulling
 *  back until the product is a thumbnail. */
function scaledPose(pose: Pose, factor: readonly [number, number, number]): Pose {
  return {
    position: [
      pose.position[0] * factor[0],
      pose.position[1] * factor[1],
      pose.position[2] * factor[2],
    ],
    rotation: pose.rotation,
    scale: pose.scale,
  };
}

/* ---- The rig ------------------------------------------------------------- */

interface RigProps {
  config: ProductConfig;
  handles: ProductHandles;
  store: ProgressStore;
  compact: boolean;
  /** Reduced motion: the finished product, held still. */
  still: boolean;
}

function ProductRig({ config, handles, store, compact, still }: RigProps) {
  const groupRef = useRef<Group>(null);
  const shadowRef = useRef<Group>(null);
  const shadowMaterial = useRef<Material | null>(null);

  // Four separate refs rather than one object of refs: an object built during
  // render is a local, and writing through a local every frame is exactly what
  // React's rules are there to stop.
  const keyLight = useRef<DirectionalLight>(null);
  const fillLight = useRef<DirectionalLight>(null);
  const rimLight = useRef<SpotLight>(null);
  const accentLight = useRef<DirectionalLight>(null);

  const exploded = useMemo(() => {
    const factor = compact ? config.compactExplode : ([1, 1, 1] as const);
    const map = new Map<PartKey, Pose>();
    for (const key of PART_KEYS) map.set(key, scaledPose(config.parts[key].exploded, factor));
    return map;
  }, [config, compact]);

  /* Measured half-sizes of each part, so the fit below knows how much room a
   * thing actually needs rather than assuming. Cached after the first frames,
   * except for parts that change shape — the label is a strip a whole unit
   * wide while it is flat and two-thirds of that once it has wrapped. */
  const extents = useRef(new Map<PartKey, PartExtent>());
  const box = useRef(new Box3());
  const worldPos = useRef(new Vector3());

  const smoothed = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const mouseSmooth = useRef({ x: 0, y: 0 });
  const camPos = useRef(new Vector3(...config.camera.keys[0]!.position));
  const camTarget = useRef(new Vector3(...config.camera.keys[0]!.target));
  const wantPos = useRef(new Vector3());
  const wantTarget = useRef(new Vector3());

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

  useFrame((state, rawDelta) => {
    // A tab that was in the background hands back a delta of several seconds;
    // clamping it stops the first frame after that from being a jump cut.
    const delta = Math.min(rawDelta, 0.1);
    const time = state.clock.elapsedTime;
    // The camera is read off the frame state rather than captured from a hook:
    // it is a three.js object that this loop writes to every frame, which is
    // exactly the thing React's rules ask you not to do with rendered values.
    const camera = state.camera;
    const size = state.size;

    if (still) smoothed.current = 1;
    else smoothed.current += (store.raw - smoothed.current) * damp(config.camera.lerp, delta);
    const p = smoothed.current;
    store.emit(p);

    /* ---- The model as a whole ------------------------------------------ */
    const group = groupRef.current;
    if (group) {
      const idle = still ? 0 : smoothstep(clamp01((p - 0.88) / 0.1));
      group.rotation.y =
        samplePairs(config.yaw, p) + idle * config.idle.yaw * Math.sin(time * 0.35);
      group.position.set(
        config.offset[0],
        config.offset[1] + idle * config.idle.float * Math.sin(time * 0.6),
        config.offset[2],
      );
    }

    /* ---- The parts ------------------------------------------------------ */
    // Idle drift belongs to the exploded stage only; once assembly starts, a
    // part that is still wandering reads as a bug rather than as weightlessness.
    const drift = still ? 0 : 1 - clamp01(p / 0.12);
    let phase = 0;

    for (const key of PART_KEYS) {
      const object = handles.parts.get(key);
      const spec = config.parts[key];
      const from = exploded.get(key);
      phase += 1.7;
      if (!object || !from) continue;

      const to = spec.assembled;
      const raw = clamp01((p - spec.window[0]) / (spec.window[1] - spec.window[0] || 1));
      const t = EASES[spec.ease](raw);

      let px = lerp(from.position[0], to.position[0], t);
      let py = lerp(from.position[1], to.position[1], t);
      let pz = lerp(from.position[2], to.position[2], t);
      let rx = lerp(from.rotation[0], to.rotation[0], t);
      let ry = lerp(from.rotation[1], to.rotation[1], t);
      let rz = lerp(from.rotation[2], to.rotation[2], t);
      let sx = lerp(from.scale[0], to.scale[0], t);
      let sy = lerp(from.scale[1], to.scale[1], t);
      let sz = lerp(from.scale[2], to.scale[2], t);

      if (drift > 0 && spec.parallax > 0) {
        const amount = spec.parallax * drift;
        px += Math.sin(time * 0.42 + phase) * 0.035 * amount;
        py += Math.sin(time * 0.33 + phase * 1.7) * 0.045 * amount;
        pz += Math.sin(time * 0.28 + phase * 2.3) * 0.03 * amount;
        rz += Math.sin(time * 0.25 + phase) * 0.05 * amount;
      }

      const secondary = spec.secondary;
      if (secondary && !still) {
        // Both of these peak mid-flight and are gone before the part lands: a
        // mechanical fit that bounces is a cartoon.
        if (secondary.spin) ry += secondary.spin * Math.sin(Math.PI * raw);
        if (secondary.sway) rz += secondary.sway * Math.sin(raw * Math.PI * 2.6) * (1 - raw);
        if (secondary.settle) {
          const s = clamp01((p - spec.window[1]) / 0.05);
          if (s > 0 && s < 1) py += secondary.settle * Math.sin(s * Math.PI * 2) * (1 - s);
        }
        if (secondary.drift) {
          ry += time * secondary.drift.yaw;
          rz += Math.sin(time * 0.8) * secondary.drift.roll;
        }
      }

      if (spec.fill) {
        const fill = windowT(p, spec.fill[0], spec.fill[1], EASES["power2.out"]);
        sy *= fill;
        object.visible = fill > 0.002;
      }

      object.position.set(px, py, pz);
      object.rotation.set(rx, ry, rz);
      object.scale.set(sx, sy, sz);

      const bend = spec.bend;
      if (bend) {
        handles.deformers.get(key)?.(windowT(p, bend[0], bend[1], EASES["power2.out"]));
      }
    }

    /* ---- The camera ----------------------------------------------------- */
    const keys = compact ? config.camera.keysCompact : config.camera.keys;
    sampleKeys(keys, p, wantPos.current, wantTarget.current);

    /* Fit: how far back the camera has to stand for this frame to hold every
     * part that is on screen.
     *
     * Measured, not estimated. The parts have just been placed, so one matrix
     * update gives their real world positions, and their real bounding boxes
     * give their real sizes; from those the required distance follows exactly,
     * for any viewport. That is what makes 1440x900, 1366x768 and a 390-wide
     * phone all safe without three sets of hand-tuned camera keys.
     *
     * Two subtleties. The page's own bar sits over the top of the frame, so
     * the usable half above the look-at point is shorter than the half below
     * it. And the fit is not always wanted: the detail shots between 60% and
     * 82% crop the product deliberately, which is what `fit` in the config
     * turns off and back on. */
    const fov = compact ? config.camera.fovCompact : config.camera.fov;
    const tan = Math.tan((fov * Math.PI) / 360);
    const aspect = size.height > 0 ? size.width / size.height : 1;
    const strength = samplePairs(config.camera.fit, p);

    if (group && strength > 0.001) {
      group.updateMatrixWorld(true);
      const topUsable = Math.max(0.45, 1 - (2 * NAV_CLEARANCE_PX) / Math.max(1, size.height));
      let needed = 0;

      for (const key of PART_KEYS) {
        const object = handles.parts.get(key);
        if (!object || !object.visible) continue;
        object.getWorldPosition(worldPos.current);

        // Re-measured while the part is still moving, because a tube lying at
        // an angle is wider than the same tube standing up, and cached once it
        // has landed and its shape has stopped changing.
        let extent = extents.current.get(key);
        if (!extent) {
          extent = { up: 0, down: 0, left: 0, right: 0, front: 0, measured: false };
          extents.current.set(key, extent);
        }
        if (!extent.measured || p <= config.parts[key].window[1]) {
          box.current.setFromObject(object);
          if (box.current.isEmpty()) continue;
          // Written in place: this runs every frame for every moving part, and
          // a fresh object per part per frame is litter the loop does not need.
          extent.up = box.current.max.y - worldPos.current.y;
          extent.down = worldPos.current.y - box.current.min.y;
          extent.left = worldPos.current.x - box.current.min.x;
          extent.right = box.current.max.x - worldPos.current.x;
          extent.front = box.current.max.z - worldPos.current.z;
          extent.measured = true;
        }

        const dx = worldPos.current.x - wantTarget.current.x;
        const dy = worldPos.current.y - wantTarget.current.y;
        const halfY = Math.max((dy + extent.up) / topUsable, extent.down - dy, 0);
        const halfX = Math.max(dx + extent.right, extent.left - dx, 0);
        // Depth matters: a part in front of the product needs more room than
        // the same part beside it, so the reach is measured to its near face.
        const reach =
          Math.max(halfY / tan, halfX / (tan * aspect)) * 1.05 +
          worldPos.current.z +
          extent.front;
        if (reach > needed) needed = reach;
      }

      const distance = wantPos.current.z;
      if (distance > 0 && needed > distance) {
        wantPos.current.multiplyScalar(lerp(1, needed / distance, strength));
      }
    }

    if (still) {
      camPos.current.copy(wantPos.current);
      camTarget.current.copy(wantTarget.current);
    } else {
      const k = damp(config.camera.lerp, delta);
      camPos.current.lerp(wantPos.current, k);
      camTarget.current.lerp(wantTarget.current, k);
    }

    camera.position.copy(camPos.current);
    camera.lookAt(camTarget.current);

    if (!still && !compact) {
      const k = damp(0.08, delta);
      mouseSmooth.current.x += (mouse.current.x - mouseSmooth.current.x) * k;
      mouseSmooth.current.y += (mouse.current.y - mouseSmooth.current.y) * k;
      camera.rotation.y += mouseSmooth.current.x * config.camera.parallax.x;
      camera.rotation.x += mouseSmooth.current.y * config.camera.parallax.y;
    }

    /* ---- Light, and the ground ------------------------------------------ */
    const hero = smoothstep(clamp01((p - 0.8) / 0.2));
    if (keyLight.current) keyLight.current.intensity = 1.9 + hero * 0.5;
    if (fillLight.current) fillLight.current.intensity = 0.6 - hero * 0.12;
    // The rim arriving is the moment the sequence stops being an exploded
    // diagram and becomes a product shot.
    if (rimLight.current) {
      rimLight.current.intensity = windowT(p, 0.7, 0.82, EASES["power2.out"]) * 3.4;
    }
    if (accentLight.current) {
      accentLight.current.intensity = windowT(p, 0.74, 0.9, EASES["power2.out"]) * 0.55;
    }
    if (shadowMaterial.current) {
      shadowMaterial.current.opacity =
        windowT(p, config.shadow.window[0], config.shadow.window[1], EASES["power2.out"]) *
        config.shadow.opacity;
    }
  });

  return (
    <>
      <StudioLights
        keyRef={keyLight}
        fillRef={fillLight}
        rimRef={rimLight}
        accentRef={accentLight}
        compact={compact}
      />
      <group ref={groupRef}>
        <ProductModel config={config} handles={handles} compact={compact} />
      </group>
      <ContactShadows
        ref={shadowRef}
        position={[0, config.shadow.y + config.offset[1], 0]}
        scale={compact ? 4 : 5}
        blur={compact ? 2.0 : 2.6}
        far={2.2}
        opacity={0}
        resolution={compact ? 256 : 512}
        color="#000000"
      />
    </>
  );
}

/** Reports the scene as ready once frames are actually reaching the screen,
 *  rather than once React thinks it has mounted. */
function ReadyProbe({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) onReady();
  });
  return null;
}

export function ProductScene({
  config,
  store,
  compact,
  still,
  onReady,
}: {
  config: ProductConfig;
  store: ProgressStore;
  compact: boolean;
  still: boolean;
  onReady: () => void;
}) {
  const handles = useMemo(() => createHandles(), []);

  return (
    <Canvas
      dpr={compact ? [1, 1.25] : [1, 1.8]}
      // Reduced motion means a still frame, so there is nothing to keep
      // redrawing: demand renders on change and then leaves the GPU alone.
      frameloop={still ? "demand" : "always"}
      camera={{
        fov: compact ? config.camera.fovCompact : config.camera.fov,
        position: [0, 0, 5.3],
        near: 0.1,
        far: 60,
      }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        // What the glass refracts is a second render of the scene. Half the
        // resolution on a phone halves the cost of the one expensive material
        // in the scene, and at that size nobody can see the difference.
        gl.transmissionResolutionScale = compact ? 0.5 : 1;
      }}
      shadows={!compact}
    >
      <Suspense fallback={null}>
        <StudioEnvironment config={config} compact={compact} />
        <ProductRig
          config={config}
          handles={handles}
          store={store}
          compact={compact}
          still={still}
        />
      </Suspense>
      <PerformanceMonitor />
      <AdaptiveDpr />
      <ReadyProbe onReady={onReady} />
    </Canvas>
  );
}
