"use client";

import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import type { ProductConfig } from "./config/types";
import type { ProductHandles } from "./handles";
import { GltfProduct } from "./parts/GltfProduct";
import { ProceduralShampoo } from "./parts/ProceduralShampoo";

/**
 * Chooses where the parts come from.
 *
 * One flag in the config decides: a path under public/models loads that GLB,
 * null draws the bottle in code. Both paths register the same ten named parts
 * with the same handles, so ScrollController never learns which one it is
 * driving.
 */

interface BoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface BoundaryState {
  failed: boolean;
}

/** Catches a GLB that will not load and falls back to the built-in bottle. */
class ModelBoundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn("[product] falling back to the procedural bottle:", error.message, info);
  }

  override render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function ProductModel({
  config,
  handles,
  compact,
}: {
  config: ProductConfig;
  handles: ProductHandles;
  compact: boolean;
}) {
  const procedural = <ProceduralShampoo handles={handles} compact={compact} />;
  const glb = config.model.glb;
  if (!glb) return procedural;

  return (
    <ModelBoundary fallback={procedural}>
      <Suspense fallback={null}>
        <GltfProduct url={glb} draco={config.model.draco} handles={handles} />
      </Suspense>
    </ModelBoundary>
  );
}
