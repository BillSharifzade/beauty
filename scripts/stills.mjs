/**
 * Renders the product stills, the no-WebGL poster and the OpenGraph image
 * from the live 3D scene.
 *
 * Needs a running dev server (npm run dev) and Google Chrome. The page is
 * opened with `?still=<product|lineup>`, which the hero section reads to
 * render one authored frame with the page chrome hidden; the section's
 * pinned frame is then screenshotted. Chrome runs on SwiftShader here, so
 * a frame takes seconds rather than milliseconds — the waits are generous.
 *
 *   BASE_URL=http://localhost:3020/beauty CHROME=/usr/bin/google-chrome node scripts/stills.mjs
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3020/beauty";
const CHROME =
  process.env.CHROME ??
  ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"][0];
const ONLY = process.argv.slice(2);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "brand");

const shots = [
  { name: "stills/cream", query: "still=cream", width: 900, height: 1125, type: "webp" },
  { name: "stills/tint", query: "still=tint", width: 900, height: 1125, type: "webp" },
  { name: "stills/shampoo", query: "still=shampoo", width: 900, height: 1125, type: "webp" },
  { name: "stills/mascara", query: "still=mascara", width: 900, height: 1125, type: "webp" },
  { name: "stills/pencil", query: "still=pencil", width: 900, height: 1125, type: "webp" },
  { name: "poster", query: "still=lineup", width: 1600, height: 1000, type: "webp" },
  { name: "og", query: "still=lineup&copy=1", width: 1200, height: 630, type: "png" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--hide-scrollbars",
    "--no-sandbox",
  ],
});

try {
  await mkdir(path.join(out, "stills"), { recursive: true });
  for (const shot of shots) {
    if (ONLY.length > 0 && !ONLY.some((name) => shot.name.includes(name))) continue;
    const page = await browser.newPage();
    await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: 1 });
    const url = `${BASE_URL}/?${shot.query}`;
    process.stdout.write(`${shot.name} ← ${url} … `);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 180000 });
    await page.waitForSelector(".pr-canvas--in", { timeout: 240000 });
    // Fonts, the mark and the environment all arrive after the first frames.
    await sleep(6000);
    const pin = await page.$(".pr-pin");
    const box = await pin.boundingBox();
    const file = path.join(out, `${shot.name}.${shot.type}`);
    await page.screenshot({
      path: file,
      type: shot.type,
      ...(shot.type === "webp" ? { quality: 88 } : {}),
      clip: { x: box.x, y: box.y, width: box.width, height: box.height },
    });
    process.stdout.write(`${path.relative(root, file)}\n`);
    await page.close();
  }
} finally {
  await browser.close();
}
