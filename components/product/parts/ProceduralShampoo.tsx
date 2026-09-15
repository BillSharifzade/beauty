"use client";

import { useEffect, useMemo, useState } from "react";
import { DoubleSide, PlaneGeometry, type Texture } from "three";
import { SHAMPOO, WRAP_RADIUS } from "../config/shampoo";
import type { ProductHandles } from "../handles";
import {
  bottleBodyGeometry,
  capGeometry,
  createBendableStrip,
  dipTubeGeometry,
  liquidGeometry,
  nozzleGeometry,
  pumpBaseGeometry,
  pumpHeadGeometry,
  shoulderRingGeometry,
  spoutGeometry,
  tubeFootGeometry,
} from "./geometry";
import { createImperfectionMap, createLabelTexture, loadLogoTexture } from "./textures";
import { Part } from "./Part";
import { asset } from "@/lib/asset";

/**
 * The shampoo, built in code.
 *
 * This is the source of parts the section ships with, and the one that runs
 * when config.model.glb is null or when a GLB fails to load. It draws the same
 * ten named parts a modelled bottle would, so the rig cannot tell the two
 * apart.
 *
 * The label is the only part whose geometry changes over the scroll: it flies
 * flat and wraps onto the glass, which is a deformation rather than a fade,
 * and the strip's setBend goes into handles.deformers for the rig to drive.
 */

/** The arc the label covers: 146 degrees, wide enough that the artwork wraps
 *  out of sight at the sides but never meets itself round the back. */
const LABEL_THETA = 2.55;
const LABEL_HEIGHT = 0.56;

function useAssets(compact: boolean) {
  const segments = compact ? 48 : 96;

  const assets = useMemo(() => {
    const strip = createBendableStrip(
      WRAP_RADIUS,
      LABEL_THETA,
      LABEL_HEIGHT,
      compact ? 40 : 72,
      compact ? 8 : 12,
    );
    return {
      body: bottleBodyGeometry(segments),
      liquid: liquidGeometry(segments),
      cap: capGeometry(segments),
      pumpBase: pumpBaseGeometry(segments),
      pumpHead: pumpHeadGeometry(segments),
      spout: spoutGeometry(segments),
      nozzle: nozzleGeometry(segments),
      tube: dipTubeGeometry(segments),
      foot: tubeFootGeometry(segments),
      ring: shoulderRingGeometry(segments),
      logoPlane: new PlaneGeometry(0.15, 0.15),
      strip,
      label: createLabelTexture(1024, 512),
      noise: createImperfectionMap(compact ? 256 : 512),
    };
  }, [segments, compact]);

  useEffect(
    () => () => {
      assets.body.dispose();
      assets.liquid.dispose();
      assets.cap.dispose();
      assets.pumpBase.dispose();
      assets.pumpHead.dispose();
      assets.spout.dispose();
      assets.nozzle.dispose();
      assets.tube.dispose();
      assets.foot.dispose();
      assets.ring.dispose();
      assets.logoPlane.dispose();
      assets.strip.geometry.dispose();
      assets.label?.texture.dispose();
      assets.noise?.dispose();
    },
    [assets],
  );

  return assets;
}

export function ProceduralShampoo({
  handles,
  compact,
}: {
  handles: ProductHandles;
  compact: boolean;
}) {
  const assets = useAssets(compact);
  const [logoMap, setLogoMap] = useState<Texture | null>(null);

  useEffect(() => {
    let alive = true;
    void loadLogoTexture(asset("/brand/hb-mark.svg")).then((texture) => {
      if (alive) setLogoMap(texture);
      else texture?.dispose();
      return null;
    });
    return () => {
      alive = false;
    };
  }, []);

  // The label is set in the shop's own display face, and a canvas drawn before
  // that face has arrived is set in the fallback. Redrawing once is cheaper
  // than blocking the whole scene on a font.
  useEffect(() => {
    const label = assets.label;
    if (!label) return undefined;
    let alive = true;
    void document.fonts.ready.then(() => {
      if (alive) label.refresh();
      return null;
    });
    return () => {
      alive = false;
    };
  }, [assets]);

  useEffect(() => {
    const setBend = assets.strip.setBend;
    handles.deformers.set("Label", setBend);
    return () => {
      handles.deformers.delete("Label");
    };
  }, [assets, handles]);

  const noise = assets.noise;
  // Reflections are what sell moulded plastic, but a bottle lit until it is
  // uniformly bright stops being transparent and becomes a milk carton.
  const glassIntensity = compact ? 0.6 : 0.75;

  return (
    <>
      <Part id="Bottle_Body" handles={handles}>
        <mesh geometry={assets.body} castShadow>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.14}
            roughnessMap={noise}
            metalness={0}
            transmission={1}
            // A thin moulded wall, not a block of glass. Large thickness values
            // bend the view so far that the dip tube behind the wall stops
            // lining up with the one in front of it, and the bottle reads as
            // frosted rather than clear.
            thickness={0.12}
            ior={1.46}
            clearcoat={0.35}
            clearcoatRoughness={0.08}
            // The tint is the shampoo showing through the wall, not the wall.
            attenuationColor="#f6e6ef"
            attenuationDistance={1.1}
            specularIntensity={0.7}
            envMapIntensity={glassIntensity}
          />
        </mesh>
      </Part>

      {/* The milkiness of the product belongs here, not to the bottle: this is
          the pearlescent shampoo, and the wall around it is clear.

          Its transmission is exactly zero, and that is load-bearing rather
          than a stylistic choice. The renderer's transmission pass draws only
          opaque objects, so anything even slightly transmissive inside the
          bottle disappears behind the wall. Thick shampoo is opaque anyway. */}
      <Part id="Liquid" handles={handles}>
        <mesh geometry={assets.liquid}>
          <meshPhysicalMaterial
            color="#f6eaf0"
            roughness={0.38}
            roughnessMap={noise}
            metalness={0}
            transmission={0}
            clearcoat={0.45}
            clearcoatRoughness={0.3}
            sheen={0.9}
            sheenColor="#ffd2ea"
            sheenRoughness={0.5}
            envMapIntensity={0.7}
          />
        </mesh>
      </Part>

      <Part id="Inner_Component_01" handles={handles}>
        <mesh geometry={assets.foot}>
          <meshPhysicalMaterial color="#c9ced4" roughness={0.42} envMapIntensity={0.8} />
        </mesh>
      </Part>

      <Part id="Inner_Component_02" handles={handles}>
        <mesh geometry={assets.ring}>
          <meshPhysicalMaterial color="#c9ced4" roughness={0.38} envMapIntensity={0.9} />
        </mesh>
      </Part>

      <Part id="Label" handles={handles}>
        <mesh geometry={assets.strip.geometry}>
          <meshPhysicalMaterial
            map={assets.label?.texture ?? null}
            roughness={0.52}
            roughnessMap={noise}
            metalness={0}
            clearcoat={0.4}
            clearcoatRoughness={0.28}
            envMapIntensity={0.6}
          />
        </mesh>
      </Part>

      <Part id="Logo" handles={handles}>
        <mesh geometry={assets.logoPlane} visible={logoMap !== null}>
          <meshPhysicalMaterial
            map={logoMap}
            transparent
            alphaTest={0.3}
            roughness={0.35}
            metalness={0}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
            envMapIntensity={0.8}
            side={DoubleSide}
          />
        </mesh>
      </Part>

      <Part id="Pump_Tube" handles={handles}>
        <mesh geometry={assets.tube}>
          <meshPhysicalMaterial
            color="#dfe4e8"
            roughness={0.28}
            metalness={0}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
            envMapIntensity={0.9}
          />
        </mesh>
      </Part>

      <Part id="Cap" handles={handles}>
        <mesh geometry={assets.cap} castShadow>
          <meshPhysicalMaterial
            color="#f400a1"
            roughness={0.32}
            roughnessMap={noise}
            metalness={0}
            clearcoat={0.9}
            clearcoatRoughness={0.16}
            envMapIntensity={1.05}
          />
        </mesh>
      </Part>

      <Part id="Pump_Base" handles={handles}>
        <mesh geometry={assets.pumpBase} castShadow>
          <meshPhysicalMaterial
            color="#f0f0f3"
            roughness={0.2}
            roughnessMap={noise}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.25}
          />
        </mesh>
      </Part>

      {/* The actuator is three meshes under one named group: the body, the
          spout and its nozzle. A GLB would merge them; here keeping them apart
          costs nothing and lets the spout tilt on its own. */}
      <Part id="Pump_Head" handles={handles}>
        <mesh geometry={assets.pumpHead} castShadow>
          <meshPhysicalMaterial
            color="#f0f0f3"
            roughness={0.2}
            roughnessMap={noise}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.25}
          />
        </mesh>
        <mesh
          geometry={assets.spout}
          position={[-0.159, -0.014, 0]}
          rotation={[0, 0, Math.PI / 2 + 0.14]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#f0f0f3"
            roughness={0.22}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.06}
            envMapIntensity={1.2}
          />
        </mesh>
        <mesh
          geometry={assets.nozzle}
          position={[-0.283, -0.032, 0]}
          rotation={[0, 0, Math.PI / 2 + 0.14]}
        >
          <meshPhysicalMaterial
            color="#d8d8dd"
            roughness={0.35}
            metalness={0}
            side={DoubleSide}
            envMapIntensity={0.9}
          />
        </mesh>
      </Part>
    </>
  );
}

/** Every part the config names is drawn above; the export exists so a
 *  consumer can assert that at a glance. */
export const PROCEDURAL_PART_COUNT = Object.keys(SHAMPOO.parts).length;
