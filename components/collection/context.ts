"use client";

import { createContext, useContext } from "react";
import type { ProductHandles } from "../product/handles";
import type { CollectionAssets } from "../product/parts/assets";

/**
 * What every product card's scene shares: one set of assets, one map of
 * handles, and the three facts about the screen. Provided inside the
 * collection's canvas, where the card scenes actually render.
 */
export interface CollectionScene {
  assets: CollectionAssets;
  handles: ProductHandles;
  compact: boolean;
  reduced: boolean;
  dark: boolean;
}

export const CollectionContext = createContext<CollectionScene | null>(null);

export function useCollectionScene(): CollectionScene {
  const value = useContext(CollectionContext);
  if (!value) throw new Error("useCollectionScene must be used inside the collection canvas");
  return value;
}
