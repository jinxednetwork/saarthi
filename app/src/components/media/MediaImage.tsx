"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import type { Category } from "@saarthi/shared";
import { CategoryIcon } from "@/components/icons";
import { CATEGORY_TINT, type MediaAsset } from "@/lib/media";
import { cn } from "@/lib/utils";

const ASPECT: Record<MediaAsset["aspect"], string> = {
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-video",
  "1/1": "aspect-square",
};

/**
 * Evidence media tile. Remote stock stand-ins today; degrades to a category-
 * tinted tile with an icon when offline or broken. Video assets render their
 * poster with a play glyph + duration chip (playback lands with real intake
 * media — the chip says "preview" so the UI never over-claims).
 */
export function MediaImage({
  asset,
  category,
  className,
  sizes = "400px",
}: {
  asset: MediaAsset;
  category: Category;
  className?: string;
  sizes?: string;
}) {
  const [broken, setBroken] = useState(false);

  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-lg bg-chip",
        ASPECT[asset.aspect],
        className,
      )}
    >
      {broken ? (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground"
          style={{ background: CATEGORY_TINT[category] }}
          role="img"
          aria-label={asset.alt}
        >
          <CategoryIcon category={category} size={22} />
          <span className="px-3 text-center text-[10px] leading-tight">
            media unavailable offline
          </span>
        </div>
      ) : (
        <Image
          src={asset.type === "video" ? (asset.poster ?? asset.src) : asset.src}
          alt={asset.alt}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setBroken(true)}
        />
      )}

      {asset.type === "video" && !broken && (
        <>
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur-sm">
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            </span>
          </span>
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white">
            {asset.duration} · preview
          </span>
        </>
      )}
    </figure>
  );
}
