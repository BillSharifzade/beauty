"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { PlaneGeometry, type BufferGeometry, type Material, type Texture } from "three";
import { WRAP } from "../config/products";
import { partKey, type ProductId } from "../config/types";
import type { ProductHandles } from "../handles";
import { createBendableStrip, cream, mascara, pencil, shampoo, tint, type BendableStrip } from "./geometry";
import {
  createLabelMaterial,
  createLogoMaterial,
  createMaterials,
  disposeMaterials,
  type MaterialSet,
} from "./materials";
import {
  createImperfectionMap,
  createLabelTexture,
  drawCreamLabel,
  drawMascaraLabel,
  drawPencilLabel,
  drawShampooLabel,
  drawTintLabel,
  loadLogoTexture,
  type LabelTexture,
} from "./textures";
import { asset } from "@/lib/asset";

/**
 * Everything the five products are drawn from, built once per mount.
 *
 * Geometry, the shared finishes, the five printed labels and the mark all
 * come from here, so a product component is nothing but a list of parts and
 * which finish each one takes. Disposed together on unmount; phones get half
 * the lathe segments and a smaller noise map.
 */

type Geometry = Record<string, BufferGeometry>;

export interface CollectionAssets {
  segments: number;
  materials: MaterialSet;
  labelMaterials: Record<ProductId, Material>;
  logoMaterial: Material;
  /** Set once the mark has loaded; the logo parts stay invisible before. */
  logoReady: boolean;
  strips: Record<ProductId, BendableStrip>;
  logoPlane: PlaneGeometry;
  /** A slightly larger plane for the mark on the cream's lid. */
  lidLogoPlane: PlaneGeometry;
  shampoo: Geometry;
  cream: Geometry;
  tint: Geometry;
  mascara: Geometry;
  pencil: Geometry;
}

export function useCollectionAssets(handles: ProductHandles, compact: boolean): CollectionAssets {
  const [logoReady, setLogoReady] = useState(false);
  // In demand mode nothing redraws on its own, so a texture that changes
  // after the fact has to ask for a frame.
  const invalidate = useThree((state) => state.invalidate);

  const built = useMemo(() => {
    const s = compact ? 44 : 80;
    const noise = createImperfectionMap(compact ? 256 : 512);
    const materials = createMaterials(noise, compact);

    const labels: Record<ProductId, LabelTexture | null> = {
      shampoo: createLabelTexture(drawShampooLabel, 1024, 512),
      cream: createLabelTexture(drawCreamLabel, 1024, 256),
      tint: createLabelTexture(drawTintLabel, 512, 384),
      mascara: createLabelTexture(drawMascaraLabel, 512, 800),
      pencil: createLabelTexture(drawPencilLabel, 192, 1024),
    };
    const map = (id: ProductId): Texture | null => labels[id]?.texture ?? null;
    const labelMaterials: Record<ProductId, Material> = {
      shampoo: createLabelMaterial(map("shampoo"), "paper", noise),
      cream: createLabelMaterial(map("cream"), "paper", noise),
      tint: createLabelMaterial(map("tint"), "paper", noise),
      mascara: createLabelMaterial(map("mascara"), "lacquer", noise),
      pencil: createLabelMaterial(map("pencil"), "lacquer", noise),
    };

    // Segment counts along the wrap follow the arc: a label that bends
    // through 146 degrees needs more facets than one that bends through 100.
    const strips: Record<ProductId, BendableStrip> = {
      shampoo: createBendableStrip(WRAP.shampoo, 2.55, 0.56, compact ? 40 : 72, compact ? 8 : 12),
      cream: createBendableStrip(WRAP.cream, 2.2, 0.22, compact ? 36 : 64, compact ? 4 : 6),
      tint: createBendableStrip(WRAP.tint, 1.7, 0.26, compact ? 24 : 48, compact ? 6 : 8),
      mascara: createBendableStrip(WRAP.mascara, 2.3, 0.5, compact ? 24 : 48, compact ? 8 : 12),
      pencil: createBendableStrip(WRAP.pencil, 1.9, 0.85, compact ? 16 : 32, compact ? 10 : 16),
    };

    const assets = {
      segments: s,
      noise,
      materials,
      labels,
      labelMaterials,
      logoMaterial: createLogoMaterial(null),
      strips,
      logoPlane: new PlaneGeometry(0.16, 0.16),
      lidLogoPlane: new PlaneGeometry(0.22, 0.22),
      shampoo: {
        body: shampoo.body(s),
        liquid: shampoo.liquid(s),
        cap: shampoo.cap(s),
        pumpBase: shampoo.pumpBase(s),
        pumpHead: shampoo.pumpHead(s),
        foot: shampoo.foot(s),
        dipTube: shampoo.dipTube(s),
        spout: shampoo.spout(s),
        nozzle: shampoo.nozzle(s),
        ring: shampoo.ring(s),
      },
      cream: { jar: cream.jar(s), fill: cream.fill(s), disc: cream.disc(s), lid: cream.lid(s) },
      tint: {
        bottle: tint.bottle(s),
        liquid: tint.liquid(s),
        collar: tint.collar(s),
        stem: tint.stem(s),
        tip: tint.tip(s),
        cap: tint.cap(s),
      },
      mascara: {
        tube: mascara.tube(s),
        collar: mascara.collar(s),
        cap: mascara.cap(s),
        stem: mascara.stem(s),
        core: mascara.core(s),
        bristle: mascara.bristle(),
      },
      pencil: {
        body: pencil.body(s),
        ring: pencil.ring(s),
        wood: pencil.wood(s),
        core: pencil.core(s),
        cap: pencil.cap(s),
      },
    };
    return assets;
  }, [compact]);

  // Dispose in one place, on the same cadence the assets were built on.
  useEffect(
    () => () => {
      const geometries: Geometry[] = [built.shampoo, built.cream, built.tint, built.mascara, built.pencil];
      for (const set of geometries) for (const geometry of Object.values(set)) geometry.dispose();
      for (const strip of Object.values(built.strips)) strip.geometry.dispose();
      built.logoPlane.dispose();
      built.lidLogoPlane.dispose();
      for (const label of Object.values(built.labels)) label?.texture.dispose();
      for (const material of Object.values(built.labelMaterials)) material.dispose();
      built.logoMaterial.dispose();
      built.noise?.dispose();
      disposeMaterials(built.materials);
    },
    [built],
  );

  // The mark arrives as an SVG fetched and rasterised at 512px; until it has,
  // the logo parts stay hidden rather than showing a white square.
  useEffect(() => {
    let alive = true;
    setLogoReady(false);
    void loadLogoTexture(asset("/brand/monogram.svg")).then((texture) => {
      if (!alive || !texture) {
        texture?.dispose();
        return null;
      }
      const material = built.logoMaterial as Material & { map: Texture | null };
      material.map = texture;
      material.needsUpdate = true;
      setLogoReady(true);
      return null;
    });
    return () => {
      alive = false;
      const material = built.logoMaterial as Material & { map: Texture | null };
      material.map?.dispose();
      material.map = null;
    };
  }, [built]);

  // The labels are set in the page's own faces, and a canvas drawn before
  // they have arrived is set in the fallback. Redrawing once is cheaper than
  // blocking the whole scene on a font.
  useEffect(() => {
    let alive = true;
    void document.fonts.ready.then(() => {
      if (!alive) return null;
      for (const label of Object.values(built.labels)) label?.refresh();
      invalidate();
      return null;
    });
    return () => {
      alive = false;
    };
  }, [built, invalidate]);

  // The labels are the parts whose geometry changes over the scroll: they fly
  // flat and wrap onto their body, and the rig drives that through here.
  useEffect(() => {
    for (const [id, strip] of Object.entries(built.strips) as [ProductId, BendableStrip][]) {
      handles.deformers.set(partKey(id, "Label"), strip.setBend);
    }
    return () => {
      for (const id of Object.keys(built.strips) as ProductId[]) handles.deformers.delete(partKey(id, "Label"));
    };
  }, [built, handles]);

  return useMemo(() => ({ ...built, logoReady }), [built, logoReady]);
}
