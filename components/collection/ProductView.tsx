"use client";

import { ContactShadows, PerspectiveCamera, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import { Box3, Group, PerspectiveCamera as ThreeCamera, Vector3 } from "three";
import { SCENE } from "../product/config/products";
import { partKey, type ProductId, type ProductSpec } from "../product/config/types";
import { damp, lerp } from "../product/easing";
import { CardLights, StudioEnvironment } from "../product/Lighting";
import { Cream } from "../product/parts/Cream";
import { Mascara } from "../product/parts/Mascara";
import { Pencil } from "../product/parts/Pencil";
import { Shampoo } from "../product/parts/Shampoo";
import { Tint } from "../product/parts/Tint";
import { useCollectionScene } from "./context";

/**
 * A product card's live 3D.
 *
 * The finished product, standing in the same studio as the hero, turning a
 * little as the card moves up the screen, and breathing apart when the
 * pointer is over it: the same parts the hero assembled, lifted a third of
 * the way back toward their exploded poses. Nothing here is animated by
 * time alone; every frame is asked for by a scroll, a hover or a resize,
 * and a card that is off screen is not drawn.
 */

const COMPONENTS = { cream: Cream, tint: Tint, shampoo: Shampoo, mascara: Mascara, pencil: Pencil } as const;

/** How far toward the exploded poses a hovered product opens. */
const OPEN = 0.32;

/** The resting three-quarter turn, radians. */
const BASE_YAW = 0.42;

interface Hover {
  target: number;
}

function CardScene({
  id,
  product,
  hover,
  track,
}: {
  id: ProductId;
  product: ProductSpec;
  hover: MutableRefObject<Hover>;
  track: MutableRefObject<HTMLElement | null>;
}) {
  const { assets, handles, compact, reduced, dark } = useCollectionScene();
  const invalidate = useThree((state) => state.invalidate);
  const size = useThree((state) => state.size);
  const group = useRef<Group>(null);
  const cameraRef = useRef<ThreeCamera>(null);

  const open = useRef(0);
  const yaw = useRef(BASE_YAW);
  const frames = useRef(0);
  const fit = useRef<{ halfY: number; halfX: number; centreY: number } | null>(null);
  const box = useRef(new Box3());
  const target = useRef(new Vector3());

  const Product = COMPONENTS[id];

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    frames.current += 1;

    /* ---- Hover: open toward the exploded poses --------------------------- */
    const want = reduced ? 0 : hover.current.target;
    open.current += (want - open.current) * damp(0.12, delta);
    const k = open.current * OPEN;

    for (const [name, spec] of Object.entries(product.parts)) {
      const object = handles.parts.get(partKey(id, name));
      if (!object) continue;
      const a = spec.assembled;
      const e = spec.exploded;
      object.position.set(
        lerp(a.position[0], e.position[0], k),
        lerp(a.position[1], e.position[1], k),
        lerp(a.position[2], e.position[2], k),
      );
      object.rotation.set(
        lerp(a.rotation[0], e.rotation[0], k),
        lerp(a.rotation[1], e.rotation[1], k),
        lerp(a.rotation[2], e.rotation[2], k),
      );
      object.scale.set(a.scale[0], a.scale[1], a.scale[2]);
      object.visible = true;
    }

    /* ---- Turn with the scroll, and a little more when hovered ----------- */
    let scroll = 0;
    const rect = track.current?.getBoundingClientRect();
    if (rect && window.innerHeight > 0) {
      scroll = (rect.top + rect.height / 2) / window.innerHeight - 0.5;
    }
    const wantYaw = reduced ? BASE_YAW : BASE_YAW - scroll * 0.9 + open.current * 0.55;
    yaw.current += (wantYaw - yaw.current) * damp(0.15, delta);
    const node = group.current;
    if (node) node.rotation.y = yaw.current;

    /* ---- The camera: measured once the parts have been placed ----------- */
    if (node && !fit.current && frames.current >= 2 && open.current < 0.01) {
      node.updateMatrixWorld(true);
      box.current.setFromObject(node);
      if (!box.current.isEmpty()) {
        const halfY = (box.current.max.y - box.current.min.y) / 2;
        const halfX = Math.max(
          Math.abs(box.current.max.x),
          Math.abs(box.current.min.x),
          Math.abs(box.current.max.z),
          Math.abs(box.current.min.z),
        );
        fit.current = { halfY, halfX, centreY: (box.current.max.y + box.current.min.y) / 2 };
      }
    }
    const camera = cameraRef.current;
    if (camera && fit.current) {
      const tan = Math.tan((camera.fov * Math.PI) / 360);
      const aspect = size.height > 0 ? size.width / size.height : 1;
      // Room for the hover opening and for the turn: a product that touches
      // the edge of its card looks trapped.
      const distance = Math.max(fit.current.halfY / tan, fit.current.halfX / (tan * aspect)) * 1.45 + 0.4;
      camera.position.set(0.18, fit.current.centreY + distance * 0.09, distance);
      target.current.set(0, fit.current.centreY - 0.02, 0);
      camera.lookAt(target.current);
    }

    // Keep asking for frames while something is still moving.
    if (Math.abs(want - open.current) > 0.002 || Math.abs(wantYaw - yaw.current) > 0.002 || frames.current < 4) {
      invalidate();
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={28} position={[0.2, 0.3, 5]} near={0.1} far={40} />
      <CardLights dark={dark} />
      <StudioEnvironment config={SCENE} compact />
      <group ref={group}>
        <Product handles={handles} a={assets} />
      </group>
      <ContactShadows
        position={[0, SCENE.ground - 0.002, 0]}
        scale={3.4}
        blur={2}
        far={1.8}
        opacity={dark ? 0.55 : 0.42}
        resolution={compact ? 128 : 256}
        color="#000000"
      />
    </>
  );
}

/**
 * The card's visual: the studio panel, and inside it the View whose
 * rectangle the shared canvas draws this product into.
 */
export function ProductView({ id, index }: { id: ProductId; index: string }) {
  const product = SCENE.products.find((candidate) => candidate.id === id);
  const track = useRef<HTMLElement | null>(null);
  const hover = useRef<Hover>({ target: 0 });

  if (!product) return null;

  return (
    <figure
      className="lp-product-visual"
      data-index={index}
      ref={track}
      onPointerEnter={() => {
        hover.current.target = 1;
      }}
      onPointerLeave={() => {
        hover.current.target = 0;
      }}
    >
      <View className="lp-product-view">
        <CardScene id={id} product={product} hover={hover} track={track} />
      </View>
    </figure>
  );
}
