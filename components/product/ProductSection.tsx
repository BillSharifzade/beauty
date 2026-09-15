"use client";

import dynamic from "next/dynamic";

/**
 * The boundary between the page and the canvas.
 *
 * Three.js, R3F, drei and GSAP together are far more JavaScript than the rest
 * of the landing page put together, and none of it can run on the server. This
 * wrapper is the only client component the page itself imports: app/page.tsx
 * stays a server component with its metadata, and the scene arrives as its own
 * chunk after the page is readable.
 *
 * The placeholder holds a screen of height so the sections below do not jump
 * when the chunk lands.
 */
const ProductScrollSection = dynamic(
  () => import("./ProductScrollSection").then((module) => module.ProductScrollSection),
  {
    ssr: false,
    loading: () => <div className="pr-placeholder" aria-hidden="true" />,
  },
);

export function ProductSection() {
  return <ProductScrollSection />;
}
