"use client";

import { AspectRatio as AspectRatioPrimitive } from "../../utils/radix-universal-stub";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
