import { DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial, type Material, type Texture } from "three";

/**
 * One set of materials for the whole collection.
 *
 * Five products share a dozen finishes between them — clear glass, pearl,
 * lacquer in three colours, brushed metal, paper — and building the finish
 * once and handing every mesh the same instance is the cheapest optimisation
 * in the scene: one shader program per finish, one uniform upload per frame,
 * and nothing to keep in step when a colour is tuned. Only the labels get
 * their own instance, because each carries its own printed map.
 *
 * The one transparent surface per product is its glass; everything inside it
 * has transmission exactly zero. That is a requirement of the engine rather
 * than a choice: the transmission pass draws only opaque objects, so even a
 * faintly transmissive liquid would vanish behind the wall. Thick shampoo and
 * cream are opaque anyway.
 */

/** The brand pink, the same value as --brand in globals.css. */
export const BRAND_PINK = "#f400a1";

export interface MaterialSet {
  glass: MeshPhysicalMaterial;
  glassRose: MeshPhysicalMaterial;
  /** The cream's jar: the same glass, read as a much thicker wall. */
  glassThick: MeshPhysicalMaterial;
  pearl: MeshPhysicalMaterial;
  cream: MeshPhysicalMaterial;
  rose: MeshPhysicalMaterial;
  lacquerWhite: MeshPhysicalMaterial;
  lacquerBlack: MeshPhysicalMaterial;
  lacquerPink: MeshPhysicalMaterial;
  satinWhite: MeshPhysicalMaterial;
  satinGrey: MeshPhysicalMaterial;
  metal: MeshStandardMaterial;
  bristle: MeshStandardMaterial;
  flock: MeshStandardMaterial;
  wood: MeshStandardMaterial;
  /** The shampoo's inner components: a dull light plastic. */
  inner: MeshPhysicalMaterial;
  nozzle: MeshPhysicalMaterial;
}

export function createMaterials(noise: Texture | null, compact: boolean): MaterialSet {
  // Reflections are what sell moulded plastic, but a bottle lit until it is
  // uniformly bright stops being transparent and becomes a milk carton.
  const glassIntensity = compact ? 0.6 : 0.75;

  const glass = new MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.14,
    roughnessMap: noise,
    metalness: 0,
    transmission: 1,
    // A thin moulded wall, not a block of glass. Large thickness values bend
    // the view so far that the dip tube behind the wall stops lining up with
    // the one in front of it.
    thickness: 0.12,
    ior: 1.46,
    clearcoat: 0.35,
    clearcoatRoughness: 0.08,
    attenuationColor: "#f6e6ef",
    attenuationDistance: 1.1,
    specularIntensity: 0.7,
    envMapIntensity: glassIntensity,
  });

  // The tint's bottle: the same glass with a rosier cast, because a red
  // liquid behind clear glass warms the wall around it.
  const glassRose = glass.clone();
  glassRose.attenuationColor.set("#f3d2dc");
  glassRose.attenuationDistance = 0.8;
  glassRose.thickness = 0.16;

  const glassThick = glass.clone();
  glassThick.thickness = 0.32;
  glassThick.attenuationColor.set("#eef2f6");
  glassThick.attenuationDistance = 1.6;

  const pearl = new MeshPhysicalMaterial({
    color: "#f6eaf0",
    roughness: 0.38,
    roughnessMap: noise,
    metalness: 0,
    transmission: 0,
    clearcoat: 0.45,
    clearcoatRoughness: 0.3,
    sheen: 0.9,
    sheenColor: "#ffd2ea",
    sheenRoughness: 0.5,
    envMapIntensity: 0.7,
  });

  const cream = new MeshPhysicalMaterial({
    color: "#f8f3ef",
    roughness: 0.55,
    roughnessMap: noise,
    metalness: 0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
    sheen: 0.6,
    sheenColor: "#fff0f6",
    sheenRoughness: 0.8,
    envMapIntensity: 0.55,
  });

  const rose = new MeshPhysicalMaterial({
    color: "#d4234f",
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.8,
  });

  const lacquer = (color: string) =>
    new MeshPhysicalMaterial({
      color,
      roughness: 0.2,
      roughnessMap: noise,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.25,
    });

  const lacquerWhite = lacquer("#f0f0f3");
  const lacquerBlack = lacquer("#0d0d10");
  lacquerBlack.envMapIntensity = 1.4;
  const lacquerPink = lacquer(BRAND_PINK);
  lacquerPink.roughness = 0.3;
  lacquerPink.clearcoat = 0.9;
  lacquerPink.clearcoatRoughness = 0.16;
  lacquerPink.envMapIntensity = 1.05;

  const satinWhite = new MeshPhysicalMaterial({
    color: "#eeeef1",
    roughness: 0.45,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.8,
  });

  const satinGrey = new MeshPhysicalMaterial({
    color: "#dfe4e8",
    roughness: 0.28,
    metalness: 0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.9,
  });

  const metal = new MeshStandardMaterial({
    color: "#d8dae0",
    roughness: 0.28,
    roughnessMap: noise,
    metalness: 1,
    envMapIntensity: 1.3,
  });

  const bristle = new MeshStandardMaterial({
    color: "#121215",
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.3,
  });

  const flock = new MeshStandardMaterial({
    color: "#2a1018",
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0.25,
  });

  const wood = new MeshStandardMaterial({
    color: "#dcc4a4",
    roughness: 0.72,
    metalness: 0,
    envMapIntensity: 0.5,
  });

  const inner = new MeshPhysicalMaterial({ color: "#c9ced4", roughness: 0.4, envMapIntensity: 0.85 });

  const nozzle = new MeshPhysicalMaterial({
    color: "#d8d8dd",
    roughness: 0.35,
    metalness: 0,
    side: DoubleSide,
    envMapIntensity: 0.9,
  });

  return {
    glass,
    glassRose,
    glassThick,
    pearl,
    cream,
    rose,
    lacquerWhite,
    lacquerBlack,
    lacquerPink,
    satinWhite,
    satinGrey,
    metal,
    bristle,
    flock,
    wood,
    inner,
    nozzle,
  };
}

/**
 * A label: printed paper, or ink printed straight onto a lacquered body.
 *
 * The material's colour stays white and the map carries the finish's own
 * colour (paper, black, pink), so a label printed on a black tube is
 * indistinguishable from the tube except where the ink is — the seam is the
 * one thing a label must never show.
 */
export function createLabelMaterial(
  map: Texture | null,
  finish: "paper" | "lacquer",
  noise: Texture | null,
): MeshPhysicalMaterial {
  if (finish === "paper") {
    return new MeshPhysicalMaterial({
      map,
      roughness: 0.52,
      roughnessMap: noise,
      metalness: 0,
      clearcoat: 0.4,
      clearcoatRoughness: 0.28,
      envMapIntensity: 0.6,
    });
  }
  return new MeshPhysicalMaterial({
    map,
    roughness: 0.2,
    roughnessMap: noise,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.25,
  });
}

/** The mark, printed with its transparent surround cut away. */
export function createLogoMaterial(map: Texture | null): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    map,
    transparent: true,
    alphaTest: 0.3,
    roughness: 0.35,
    metalness: 0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.8,
    side: DoubleSide,
  });
}

export function disposeMaterials(set: MaterialSet): void {
  for (const material of Object.values(set) as Material[]) material.dispose();
}
