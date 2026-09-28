export interface SubPageParent {
  label: string;
  href: string;
}

/** Resolves the hierarchical parent route used by a compact bar back link. */
export function resolveSubPageParent(route: string): SubPageParent {
  const segments = route.split("/").filter(Boolean);
  const parentSegments = segments.slice(0, -1);
  const href = parentSegments.length > 0 ? `/${parentSegments.join("/")}` : "/";
  return { href, label: parentSegments.at(-1) ?? COMPACT_BAR_COPY.defaultParent };
}
import { COMPACT_BAR_COPY } from "./compact-bar.copy";
