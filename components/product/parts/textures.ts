import { CanvasTexture, LinearFilter, RepeatWrapping, SRGBColorSpace, Texture } from "three";

/**
 * Textures drawn in the browser rather than shipped as files.
 *
 * A landing page that pulls two megabytes of 4K maps to show one bottle has
 * paid for the render with the thing the render was supposed to sell. All
 * three maps here are generated once on the client: a noise map that gives the
 * plastic its imperfections, the printed label, and the shop's own mark.
 *
 * Everything returns null rather than throwing when a 2D context is not
 * available: the scene has to survive a browser that gives us WebGL but not a
 * canvas context, and a missing roughness map is a slightly cleaner bottle,
 * not a blank section.
 */

function makeCanvas(width: number, height: number): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d");
}

/**
 * Micro-imperfection map: broad low-frequency blotches plus a handful of faint
 * scratches. Used as a roughness map, so what it actually controls is where
 * the highlights break up. Perfectly even roughness is the single clearest
 * tell that a render is a render.
 */
export function createImperfectionMap(size = 512): CanvasTexture | null {
  const ctx = makeCanvas(size, size);
  if (!ctx) return null;

  // Near white, deliberately. A roughness map multiplies the material's own
  // roughness, so a mid-grey map halves whatever the material asked for — and
  // on transmissive glass that difference is the difference between seeing the
  // dip tube through the wall and not. The map varies the value; it does not
  // set it.
  ctx.fillStyle = "#e8e8e8";
  ctx.fillRect(0, 0, size, size);

  // Deterministic noise: the same bottle every reload, and no dependency on
  // Math.random ordering between the label draw and this one.
  let seed = 0x2f6e2b1;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  for (let i = 0; i < 140; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 12 + rand() * 90;
    const shade = 200 + Math.round(rand() * 55);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(${shade}, ${shade}, ${shade}, 0.5)`);
    gradient.addColorStop(1, `rgba(${shade}, ${shade}, ${shade}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineWidth = 1;
  for (let i = 0; i < 26; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 20 + rand() * 130;
    const angle = rand() * Math.PI;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + rand() * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  const texture = new CanvasTexture(ctx.canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 3);
  texture.minFilter = LinearFilter;
  return texture;
}

/** The family name next/font generated for Fixel Display, so the label is set
 *  in the shop's own face rather than in whatever the canvas defaults to. */
function displayFamily(): string {
  if (typeof document === "undefined") return "sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-display")
    .trim();
  return value.length > 0 ? `${value}, sans-serif` : "sans-serif";
}

function setTracking(ctx: CanvasRenderingContext2D, px: number): void {
  // letterSpacing is Chromium-and-friends only; without it the label is merely
  // less wide-set, which is a shrug rather than a bug.
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
}

/**
 * The printed label.
 *
 * Drawn centred, because u = 0.5 of the strip is the point that faces the
 * camera once the label wraps: the name has to be at the middle of the arc,
 * not at its left edge.
 */
export function drawLabel(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const family = displayFamily();
  const cx = w / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f4f1ec";
  ctx.fillRect(0, 0, w, h);

  // A paper that is perfectly flat reads as a swatch; this is the faint tonal
  // roll a printed stock has under a softbox.
  const sheen = ctx.createLinearGradient(0, 0, w, 0);
  sheen.addColorStop(0, "rgba(0, 0, 0, 0.06)");
  sheen.addColorStop(0.42, "rgba(255, 255, 255, 0.05)");
  sheen.addColorStop(0.6, "rgba(255, 255, 255, 0.03)");
  sheen.addColorStop(1, "rgba(0, 0, 0, 0.07)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Eyebrow with rules either side.
  ctx.fillStyle = "#c8008a";
  setTracking(ctx, 9);
  ctx.font = `500 27px ${family}`;
  ctx.fillText("HAYAT BEAUTY", cx, 118);
  setTracking(ctx, 0);

  ctx.strokeStyle = "rgba(200, 0, 138, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 330, 110);
  ctx.lineTo(cx - 160, 110);
  ctx.moveTo(cx + 160, 110);
  ctx.lineTo(cx + 330, 110);
  ctx.stroke();

  ctx.fillStyle = "#141419";
  setTracking(ctx, 4);
  ctx.font = `600 108px ${family}`;
  ctx.fillText("SHAMPOO", cx, 268);

  ctx.fillStyle = "#5c5c66";
  setTracking(ctx, 7);
  ctx.font = `400 27px ${family}`;
  ctx.fillText("УХОД ЗА ВОЛОСАМИ", cx, 328);

  ctx.strokeStyle = "rgba(20, 20, 25, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 260, 372);
  ctx.lineTo(cx + 260, 372);
  ctx.stroke();

  ctx.fillStyle = "#6b6b74";
  setTracking(ctx, 5);
  ctx.font = `400 24px ${family}`;
  ctx.fillText("БЕЗ СУЛЬФАТОВ · pH 5.5 · 300 ml", cx, 424);
  setTracking(ctx, 0);

  // The fine print at the edges wraps around the sides of the bottle, where a
  // real label puts its ingredients. Never legible, always present.
  ctx.fillStyle = "rgba(90, 90, 100, 0.5)";
  ctx.font = `400 13px ${family}`;
  ctx.textAlign = "left";
  const smallPrint = [
    "AQUA · COCAMIDOPROPYL BETAINE · GLYCERIN",
    "PANTHENOL · CITRIC ACID · PARFUM",
    "HAYAT BEAUTY, DUSHANBE · HBSHOP.TJ",
  ];
  smallPrint.forEach((line, i) => {
    ctx.fillText(line, 34, 150 + i * 22);
  });
  ctx.textAlign = "right";
  smallPrint.forEach((line, i) => {
    ctx.fillText(line, w - 34, 150 + i * 22);
  });
  ctx.textAlign = "center";
}

export interface LabelTexture {
  texture: CanvasTexture;
  /** Redraw once the display face has actually loaded. Called by the scene. */
  refresh: () => void;
}

export function createLabelTexture(width = 1024, height = 512): LabelTexture | null {
  const ctx = makeCanvas(width, height);
  if (!ctx) return null;
  drawLabel(ctx);
  const texture = new CanvasTexture(ctx.canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return {
    texture,
    refresh: () => {
      drawLabel(ctx);
      texture.needsUpdate = true;
    },
  };
}

/**
 * The shop's mark, taken from public/brand/hb-mark.svg.
 *
 * The file declares itself 64px square, and a browser rasterises an SVG image
 * at its intrinsic size before drawImage ever sees it, which would put a
 * 64-pixel logo on the bottle. Rewriting the two attributes in the source and
 * loading that through a blob is the difference between a crisp mark and a
 * smear, and it still means one source of truth for the artwork.
 */
export function loadLogoTexture(src: string, size = 512): Promise<Texture | null> {
  if (typeof document === "undefined") return Promise.resolve(null);

  return fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status}`);
      return response.text();
    })
    .then(
      (svg) =>
        new Promise<Texture | null>((resolve) => {
          const scaled = svg
            .replace(/width="\d+"/, `width="${size}"`)
            .replace(/height="\d+"/, `height="${size}"`);
          const url = URL.createObjectURL(new Blob([scaled], { type: "image/svg+xml" }));
          const image = new Image();
          image.addEventListener("load", () => {
            const ctx = makeCanvas(size, size);
            URL.revokeObjectURL(url);
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(image, 0, 0, size, size);
            const texture = new CanvasTexture(ctx.canvas);
            texture.colorSpace = SRGBColorSpace;
            texture.anisotropy = 8;
            resolve(texture);
          });
          image.addEventListener("error", () => {
            URL.revokeObjectURL(url);
            resolve(null);
          });
          image.src = url;
        }),
    )
    .catch(() => null);
}
