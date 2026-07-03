import type { Category } from "@saarthi/shared";

/**
 * v1 UI category grouping (design: Dashboard.dc.html filter chips).
 * The shared model keeps `health` and `air_quality` distinct (§6.1); the v1 UI
 * groups them under "Public Health" per §2's category scope. This mapping is the
 * ONE place that translation lives.
 */
export type CategoryGroup = "water" | "health" | "infra";

export const CATEGORY_GROUPS: Record<
  CategoryGroup,
  { label: string; label_hi: string; color: string; members: Category[] }
> = {
  water: {
    label: "Water & Sanitation",
    label_hi: "जल एवं स्वच्छता",
    color: "#054A91",
    members: ["water"],
  },
  health: {
    label: "Public Health",
    label_hi: "सार्वजनिक स्वास्थ्य",
    color: "#8A5219",
    members: ["health", "air_quality"],
  },
  infra: {
    label: "Urban Infrastructure",
    label_hi: "शहरी अवसंरचना",
    color: "#4A6A87",
    members: ["infrastructure", "other"],
  },
};

export function groupOf(category: Category): CategoryGroup {
  for (const [key, g] of Object.entries(CATEGORY_GROUPS)) {
    if (g.members.includes(category)) return key as CategoryGroup;
  }
  return "infra";
}

export function groupLabel(category: Category, hi = false): string {
  const g = CATEGORY_GROUPS[groupOf(category)];
  return hi ? g.label_hi : g.label;
}

export function groupColor(category: Category): string {
  return CATEGORY_GROUPS[groupOf(category)].color;
}
