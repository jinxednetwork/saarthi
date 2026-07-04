import type { Category } from "@saarthi/shared";

/**
 * Demo media — curated, URL-verified stock photos standing in for citizen-
 * submitted photos/videos until real intake media exists. Every asset degrades
 * to a category-tinted tile offline (see MediaImage). Swap `src` values for
 * Cloud Storage signed URLs in Phase 2+.
 */
export interface MediaAsset {
  type: "image" | "video";
  src: string;
  /** Poster for videos (and the demo stand-in for playback). */
  poster?: string;
  /** Rendered aspect — drives the masonry variance. */
  aspect: "4/3" | "3/4" | "16/9" | "1/1";
  alt: string;
  /** Duration chip for video assets, e.g. "0:14". */
  duration?: string;
}

const U = (id: string, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format`;

/** Verified image pool (all curl-checked 200, content eyeballed). */
export const IMG = {
  flood: U("photo-1547683905-f686c993aae5"), //       flooded street, submerged cars
  rainSurface: U("photo-1428592953211-077101b2021b"), // rainwater surface
  garbage: U("photo-1530587191325-3db32d826c18"), //   plastic waste
  indiaGateHaze: U("photo-1587474260584-136574528ed5"), // India Gate in dusk haze
  darkStreet: U("photo-1573348722427-f1d6819fdf98"), // under-lit street at night
  nightHighway: U("photo-1470723710355-95304d8aece4"), // night traffic corridor
  flag: U("photo-1532375810709-75b1da00537c"), //      Indian flag
  phoneApp: U("photo-1554672408-730436b60dde"), //     widget submission on phone
  humayun: U("photo-1597040663342-45b6af3d91a5"), //   Humayun's Tomb, Delhi
  construction: U("photo-1503387762-592deb58ef4e"), // construction site
} as const;

/** Per-cluster evidence media (drawer strip + feed cards). */
export const CLUSTER_MEDIA: Record<string, MediaAsset[]> = {
  cl_01: [
    {
      type: "image",
      src: IMG.flood,
      aspect: "16/9",
      alt: "Citizen photo — arterial road under knee-deep water, Karol Bagh",
    },
    {
      type: "video",
      src: IMG.rainSurface,
      poster: IMG.rainSurface,
      aspect: "4/3",
      alt: "Citizen video — water rising outside Karol Bagh main market",
      duration: "0:14",
    },
  ],
  cl_02: [
    {
      type: "image",
      src: IMG.garbage,
      aspect: "4/3",
      alt: "Citizen photo — discarded bottles near Kalkaji Ext. water point",
    },
    {
      type: "image",
      src: IMG.rainSurface,
      aspect: "16/9",
      alt: "Citizen photo — discoloured supply water, Malviya Nagar",
    },
  ],
  cl_03: [
    {
      type: "image",
      src: IMG.indiaGateHaze,
      aspect: "16/9",
      alt: "Citizen photo — haze over the India Gate corridor at dusk",
    },
    {
      type: "image",
      src: IMG.construction,
      aspect: "4/3",
      alt: "Citizen photo — uncovered construction site, Chanakyapuri",
    },
  ],
  cl_04: [
    {
      type: "image",
      src: IMG.darkStreet,
      aspect: "4/3",
      alt: "Citizen photo — unlit stretch after dark, Rajinder Nagar",
    },
    {
      type: "image",
      src: IMG.nightHighway,
      aspect: "16/9",
      alt: "Citizen photo — working lights end at the Patel Nagar junction",
    },
  ],
  cl_05: [
    {
      type: "image",
      src: IMG.rainSurface,
      aspect: "4/3",
      alt: "Citizen photo — overflow pooling near residences, R.K. Puram Sector 4",
    },
  ],
  cl_06: [
    {
      type: "image",
      src: IMG.garbage,
      aspect: "4/3",
      alt: "Citizen photo — uncollected waste, Kasturba Nagar",
    },
  ],
};

/** Offline/broken-image fallback tint per category (MediaImage). */
export const CATEGORY_TINT: Record<Category, string> = {
  water: "hsl(210 60% 40% / 0.25)",
  health: "hsl(30 55% 45% / 0.25)",
  air_quality: "hsl(30 55% 45% / 0.25)",
  infrastructure: "hsl(215 35% 50% / 0.25)",
  other: "hsl(220 10% 50% / 0.25)",
};
