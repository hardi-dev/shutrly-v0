"use client";

import { cn } from "@/ui/cn/cn";
import { useImageFallback } from "@/ui/hooks/use-image-fallback/use-image-fallback";

import type { PhotoThumbProps } from "./photo-thumb.types";

/** A small rounded photo thumbnail with the media-route fallback and no referrer (ADR-019, C-103). @param props - the image and its size @returns the thumbnail */
export function PhotoThumb({ image, size }: Readonly<PhotoThumbProps>) {
  const shown = useImageFallback(image.src, image.fallbackSrc);
  return (
    <span
      className={cn(
        "shrink-0 overflow-hidden rounded-(--radius-sm) bg-(--component-photo-tile-image-background)",
        size === "md" ? "size-12" : "size-14",
      )}
    >
      {shown.src === null ? null : (
        // eslint-disable-next-line @next/next/no-img-element -- the private media route must not go through the image optimiser
        <img
          src={shown.src}
          alt=""
          referrerPolicy="no-referrer"
          onError={shown.onError}
          className="size-full object-cover"
        />
      )}
    </span>
  );
}
