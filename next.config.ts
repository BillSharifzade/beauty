import type { NextConfig } from "next";

// GitHub Pages serves a project site under /<repo>/, so every asset and link
// needs that prefix. BASE_PATH="" builds a root-hosted copy instead.
const basePath = process.env.BASE_PATH ?? "/beauty";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Plain <img src> and texture URLs are not rewritten by basePath the way
  // next/link is, so the pages read the prefix from here (see lib/asset.ts).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
