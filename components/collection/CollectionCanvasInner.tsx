"use client";

import { View } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, type ReactNode } from "react";
import { ACESFilmicToneMapping } from "three";
import { createHandles, type ProductHandles } from "../product/handles";
import { useCollectionAssets } from "../product/parts/assets";
import { CollectionContext } from "./context";

/** Builds the shared assets inside the canvas and hands them to every view. */
function Provider({
  handles,
  compact,
  reduced,
  dark,
  children,
}: {
  handles: ProductHandles;
  compact: boolean;
  reduced: boolean;
  dark: boolean;
  children: ReactNode;
}) {
  const assets = useCollectionAssets(handles, compact);
  const value = useMemo(
    () => ({ assets, handles, compact, reduced, dark }),
    [assets, handles, compact, reduced, dark],
  );
  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

/** The canvas draws on demand; scrolling and resizing are the demands, since
 *  both move the cards and turn the products. */
function ScrollInvalidator() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    let frame = 0;
    const request = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        invalidate();
      });
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [invalidate]);
  return null;
}

function Exposure({ dark }: { dark: boolean }) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    gl.toneMappingExposure = dark ? 1.05 : 1.0;
    invalidate();
  }, [gl, dark, invalidate]);
  return null;
}

export function CollectionCanvasInner({
  compact,
  reduced,
  dark,
}: {
  compact: boolean;
  reduced: boolean;
  dark: boolean;
}) {
  const handles = useMemo(() => createHandles(), []);

  return (
    <Canvas
      className="cv-canvas"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 5 }}
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = dark ? 1.05 : 1.0;
        gl.transmissionResolutionScale = compact ? 0.5 : 1;
      }}
    >
      <Provider handles={handles} compact={compact} reduced={reduced} dark={dark}>
        <View.Port />
      </Provider>
      <ScrollInvalidator />
      <Exposure dark={dark} />
    </Canvas>
  );
}
