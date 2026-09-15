"use client";

import { Environment, Lightformer } from "@react-three/drei";
import type { RefObject } from "react";
import type { DirectionalLight, SpotLight } from "three";
import type { SceneConfig } from "./config/types";

/**
 * A studio, with no HDRI file to download.
 *
 * Reflections are most of what makes moulded plastic and a glass wall read as
 * materials, and reflections come from what is around the product. Rather than
 * ship a five-megabyte probe, the environment is built from emissive planes
 * placed the way a photographer would place them: a large softbox to the left
 * doing the modelling, a smaller fill to the right, a rim behind, a top light,
 * and two narrow strips at the front whose job is the vertical highlights that
 * run down a bottle and tell you it is round.
 *
 * It is baked once (frames={1}) because none of it moves. The lights that do
 * move over the scroll are the real ones below, and the rig owns them, so the
 * whole section still has exactly one useFrame.
 *
 * The row is wide, so the softboxes are: every former spans the whole lineup.
 */
export function StudioEnvironment({
  config,
  compact,
}: {
  config: SceneConfig;
  compact: boolean;
}) {
  const resolution = compact
    ? config.environment.resolutionCompact
    : config.environment.resolution;

  return (
    <Environment resolution={resolution} frames={1}>
      {/* Key softbox, camera left and slightly forward. */}
      <Lightformer
        form="rect"
        intensity={2.6}
        color="#ffffff"
        position={[-3.4, 1.2, 2.2]}
        rotation-y={Math.PI / 2.6}
        scale={[3.2, 7, 1]}
      />
      {/* Fill, camera right, about a third of the key. */}
      <Lightformer
        form="rect"
        intensity={0.7}
        color="#e8ecf2"
        position={[3.4, 0.4, 1.6]}
        rotation-y={-Math.PI / 2.6}
        scale={[3.4, 6, 1]}
      />
      {/* Rim behind, which is what separates a dark bottle from a dark room. */}
      <Lightformer
        form="rect"
        intensity={2.0}
        color="#ffffff"
        position={[0, 0.6, -4.2]}
        scale={[4.5, 7, 1]}
      />
      {/* Top light: the long highlight down the shoulder comes from here. */}
      <Lightformer
        form="rect"
        intensity={0.7}
        color="#ffffff"
        position={[0, 5, 0]}
        rotation-x={Math.PI / 2}
        scale={[8, 8, 1]}
      />
      {/* The two narrow strips: vertical highlights on a cylinder. */}
      <Lightformer
        form="rect"
        intensity={2.6}
        color="#ffffff"
        position={[-1.5, 0, 3]}
        scale={[0.22, 6.5, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#f2f4ff"
        position={[1.6, 0.1, 2.6]}
        scale={[0.14, 5.5, 1]}
      />
      {/* A trace of the brand's pink in the room, well under the point where
          it would tint the products. */}
      <Lightformer
        form="circle"
        intensity={0.6}
        color="#f400a1"
        position={[-2.2, -1.6, -2.4]}
        scale={[3, 3, 1]}
      />
    </Environment>
  );
}

/**
 * The lights whose intensity is animated by the rig.
 *
 * The rim is the one that matters: it is off through the whole assembly and
 * comes up between 70% and 82%, which is the moment the sequence stops being
 * about engineering and starts being about the product.
 */
export function StudioLights({
  keyRef,
  fillRef,
  rimRef,
  accentRef,
  compact,
}: {
  keyRef: RefObject<DirectionalLight | null>;
  fillRef: RefObject<DirectionalLight | null>;
  rimRef: RefObject<SpotLight | null>;
  accentRef: RefObject<DirectionalLight | null>;
  compact: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight
        ref={keyRef}
        position={[-3.2, 3.4, 3.6]}
        intensity={2.1}
        color="#ffffff"
        castShadow={!compact}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={12}
        shadow-bias={-0.0012}
      />
      <directionalLight ref={fillRef} position={[3.6, 0.8, 2.4]} intensity={0.6} color="#dde4f0" />
      <spotLight
        ref={rimRef}
        position={[-2.6, 2.2, -3.2]}
        angle={0.7}
        penumbra={0.9}
        intensity={0}
        distance={14}
        color="#ffffff"
      />
      <directionalLight
        ref={accentRef}
        position={[2.8, -0.6, -2.2]}
        intensity={0}
        color="#ff5ec4"
      />
    </>
  );
}
