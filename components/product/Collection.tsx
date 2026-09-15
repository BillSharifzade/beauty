"use client";

import { useCallback, type ReactNode } from "react";
import type { Object3D } from "three";
import type { ProductId } from "./config/types";
import type { ProductHandles } from "./handles";
import { useCollectionAssets } from "./parts/assets";
import { Cream } from "./parts/Cream";
import { Mascara } from "./parts/Mascara";
import { Pencil } from "./parts/Pencil";
import { Shampoo } from "./parts/Shampoo";
import { Tint } from "./parts/Tint";

/**
 * The five products, each under its own named group.
 *
 * The group is what the rig places on the product's slot and turns; the
 * parts inside it are placed relative to it. Position and rotation are not
 * props here for the same reason they are not on Part: the rig owns them.
 */
function Product({
  id,
  handles,
  children,
}: {
  id: ProductId;
  handles: ProductHandles;
  children: ReactNode;
}) {
  const ref = useCallback(
    (object: Object3D | null) => {
      if (!object) return undefined;
      handles.products.set(id, object);
      return () => {
        handles.products.delete(id);
      };
    },
    [id, handles],
  );

  return (
    <group ref={ref} name={id}>
      {children}
    </group>
  );
}

export function Collection({ handles, compact }: { handles: ProductHandles; compact: boolean }) {
  const a = useCollectionAssets(handles, compact);

  return (
    <>
      <Product id="cream" handles={handles}>
        <Cream handles={handles} a={a} />
      </Product>
      <Product id="tint" handles={handles}>
        <Tint handles={handles} a={a} />
      </Product>
      <Product id="shampoo" handles={handles}>
        <Shampoo handles={handles} a={a} />
      </Product>
      <Product id="mascara" handles={handles}>
        <Mascara handles={handles} a={a} />
      </Product>
      <Product id="pencil" handles={handles}>
        <Pencil handles={handles} a={a} />
      </Product>
    </>
  );
}
