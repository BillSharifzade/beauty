"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

/**
 * A product still from public/brand/stills, rendered by scripts/stills.mjs.
 *
 * Until the stills have been rendered the file is missing, and a broken image
 * icon on a product card is worse than no image: the card's dark panel with
 * its number stays on its own. The image only ever adds to it.
 */
export function Still({ id, alt }: { id: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(`/brand/stills/${id}.webp`)}
      alt={alt}
      width={900}
      height={1125}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
