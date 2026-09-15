import { CanvasTexture, LinearFilter, RepeatWrapping, SRGBColorSpace, Texture } from "three";

/**
 * Textures drawn in the browser rather than shipped as files.
 *
 * A landing page that pulls two megabytes of maps to show five products has
 * paid for the render with the thing the render was supposed to sell. All of
 * the maps here are generated once on the client: a noise map that gives the
 * plastic its imperfections, five printed labels, and the brand's mark.
 *
 * Everything returns null rather than throwing when a 2D context is not
 * available: the scene has to survive a browser that gives us WebGL but not a
 * canvas context, and a missing label is a plainer bottle, not a blank section.
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
  // roughness, so a mid-grey map halves whatever the material asked for. The
  // map varies the value; it does not set it.
  ctx.fillStyle = "#e8e8e8";
  ctx.fillRect(0, 0, size, size);

  // Deterministic noise: the same products every reload.
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

/* ---- Type on the labels ---------------------------------------------------
 * The families next/font generated, read off the document so the labels are
 * set in the page's own faces: the serif for the name, the display sans for
 * everything else. */
function family(variable: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value.length > 0 ? `${value}, ${fallback}` : fallback;
}

const serif = () => family("--font-serif", "serif");
const display = () => family("--font-display", "sans-serif");

function setTracking(ctx: CanvasRenderingContext2D, px: number): void {
  // letterSpacing is Chromium-and-friends only; without it the label is merely
  // less wide-set, which is a shrug rather than a bug.
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
}

/** The brand name, the way the wordmark sets it: serif, capitals, wide. */
function wordmark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.fillStyle = color;
  setTracking(ctx, size * 0.26);
  ctx.font = `500 ${size}px ${serif()}`;
  ctx.fillText("VELVÉ", x, y);
  setTracking(ctx, 0);
}

/** The faint tonal roll a printed stock has under a softbox. */
function paper(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f4f1ec";
  ctx.fillRect(0, 0, w, h);
  const sheen = ctx.createLinearGradient(0, 0, w, 0);
  sheen.addColorStop(0, "rgba(0, 0, 0, 0.06)");
  sheen.addColorStop(0.42, "rgba(255, 255, 255, 0.05)");
  sheen.addColorStop(0.6, "rgba(255, 255, 255, 0.03)");
  sheen.addColorStop(1, "rgba(0, 0, 0, 0.07)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
}

function rule(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, color: string, width = 1): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

/** The fine print at the edges, which wraps round the sides of a body where a
 *  real label puts its ingredients. Never legible, always present. */
function smallPrint(ctx: CanvasRenderingContext2D, w: number, top: number, lines: readonly string[], size = 13): void {
  ctx.fillStyle = "rgba(90, 90, 100, 0.5)";
  ctx.font = `400 ${size}px ${display()}`;
  ctx.textAlign = "left";
  lines.forEach((line, i) => ctx.fillText(line, 34, top + i * (size + 9)));
  ctx.textAlign = "right";
  lines.forEach((line, i) => ctx.fillText(line, w - 34, top + i * (size + 9)));
  ctx.textAlign = "center";
}

/** Text standing on its side, for the products that stand upright and read
 *  along their height: the mascara and the pencil. */
function vertical(ctx: CanvasRenderingContext2D, w: number, h: number, draw: () => void): void {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  draw();
  ctx.restore();
}

/* ---- The five labels --------------------------------------------------------
 * Every one is drawn centred, because u = 0.5 of the strip is the point that
 * faces the camera once the label wraps: the name has to be at the middle of
 * the arc, not at its left edge. */

export function drawShampooLabel(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;
  paper(ctx, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  wordmark(ctx, cx, 122, 38, "#c8008a");
  rule(ctx, cx - 330, cx - 150, 110, "rgba(200, 0, 138, 0.45)", 1.5);
  rule(ctx, cx + 150, cx + 330, 110, "rgba(200, 0, 138, 0.45)", 1.5);

  ctx.fillStyle = "#141419";
  setTracking(ctx, 4);
  ctx.font = `600 108px ${display()}`;
  ctx.fillText("SHAMPOO", cx, 268);

  ctx.fillStyle = "#5c5c66";
  setTracking(ctx, 7);
  ctx.font = `400 27px ${display()}`;
  ctx.fillText("МЯГКОЕ ОЧИЩЕНИЕ", cx, 328);

  rule(ctx, cx - 260, cx + 260, 372, "rgba(20, 20, 25, 0.18)");

  ctx.fillStyle = "#6b6b74";
  setTracking(ctx, 5);
  ctx.font = `400 24px ${display()}`;
  ctx.fillText("БЕЗ СУЛЬФАТОВ · pH 5.5 · 300 ml", cx, 424);
  setTracking(ctx, 0);

  smallPrint(ctx, w, 150, [
    "AQUA · COCO-GLUCOSIDE · GLYCERIN",
    "PANTHENOL · INULIN · CITRIC ACID",
    "VELVÉ BEAUTY · COLLECTION 2026",
  ]);
}

export function drawCreamLabel(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;
  paper(ctx, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  wordmark(ctx, cx, 84, 34, "#c8008a");

  ctx.fillStyle = "#141419";
  setTracking(ctx, 6);
  ctx.font = `600 64px ${display()}`;
  ctx.fillText("HYDRA CREAM", cx, 162);

  ctx.fillStyle = "#6b6b74";
  setTracking(ctx, 5);
  ctx.font = `400 21px ${display()}`;
  ctx.fillText("УВЛАЖНЯЮЩИЙ КРЕМ · 48 H · 50 ml", cx, 212);
  setTracking(ctx, 0);

  smallPrint(ctx, w, 96, ["AQUA · SQUALANE", "NIACINAMIDE 5%", "CERAMIDE NP"], 12);
}

export function drawTintLabel(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;
  paper(ctx, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  wordmark(ctx, cx, 92, 30, "#c8008a");

  ctx.fillStyle = "#141419";
  setTracking(ctx, 4);
  ctx.font = `600 92px ${display()}`;
  ctx.fillText("TINT", cx, 206);

  ctx.fillStyle = "#c8008a";
  setTracking(ctx, 6);
  ctx.font = `500 22px ${display()}`;
  ctx.fillText("04 · ROSE", cx, 256);

  rule(ctx, cx - 120, cx + 120, 284, "rgba(20, 20, 25, 0.18)");

  ctx.fillStyle = "#6b6b74";
  setTracking(ctx, 4);
  ctx.font = `400 18px ${display()}`;
  ctx.fillText("ТИНТ ДЛЯ ГУБ · 6 ml", cx, 322);
  setTracking(ctx, 0);
}

export function drawMascaraLabel(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  // Printed straight onto the black tube: the base matches the lacquer.
  ctx.fillStyle = "#0d0d10";
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = "middle";

  vertical(ctx, w, h, () => {
    wordmark(ctx, -150, 0, 60, "#f7f7f9");
    ctx.fillStyle = "rgba(247, 247, 249, 0.72)";
    setTracking(ctx, 8);
    ctx.font = `500 26px ${display()}`;
    ctx.fillText("VOLUME MASCARA", 120, 2);
    ctx.fillStyle = "rgba(247, 247, 249, 0.4)";
    setTracking(ctx, 5);
    ctx.font = `400 16px ${display()}`;
    ctx.fillText("01 · BLACK · 9 ml", 300, 2);
    setTracking(ctx, 0);
  });
}

export function drawPencilLabel(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  // Printed straight onto the pink lacquer.
  ctx.fillStyle = "#f400a1";
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = "middle";

  vertical(ctx, w, h, () => {
    wordmark(ctx, -260, 0, 64, "#ffffff");
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    setTracking(ctx, 6);
    ctx.font = `500 24px ${display()}`;
    ctx.fillText("EYE PENCIL · 01 NOIR", 140, 2);
    setTracking(ctx, 0);
  });
}

export interface LabelTexture {
  texture: CanvasTexture;
  /** Redraw once the faces have actually loaded. Called by the collection. */
  refresh: () => void;
}

export function createLabelTexture(
  draw: (ctx: CanvasRenderingContext2D) => void,
  width: number,
  height: number,
): LabelTexture | null {
  const ctx = makeCanvas(width, height);
  if (!ctx) return null;
  draw(ctx);
  const texture = new CanvasTexture(ctx.canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return {
    texture,
    refresh: () => {
      draw(ctx);
      texture.needsUpdate = true;
    },
  };
}

/**
 * The brand's mark, taken from an SVG under public/brand.
 *
 * The file declares itself 64px square, and a browser rasterises an SVG image
 * at its intrinsic size before drawImage ever sees it, which would put a
 * 64-pixel logo on the products. Rewriting the two attributes in the source
 * and loading that through a blob is the difference between a crisp mark and
 * a smear, and it still means one source of truth for the artwork.
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
