export interface SubPageParent {
  label: string;
  href: string;
}

/** Resolves the hierarchical parent route used by a compact bar back link. */
export function resolveSubPageParent(route: string, defaultParent: string): SubPageParent {
  const segments = route.split("/").filter(Boolean);
  const parentSegments = segments.slice(0, -1);
  const href = parentSegments.length > 0 ? `/${parentSegments.join("/")}` : "/";
  return { href, label: parentSegments.at(-1) ?? defaultParent };
}
