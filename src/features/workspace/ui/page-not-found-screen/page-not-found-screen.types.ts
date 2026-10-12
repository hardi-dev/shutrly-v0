import type { OwnerSection } from "@/features/workspace/ui/owner-trail/owner-trail.types";

/** Where the page-not-found back link goes: a parent section, or the workspace dashboard (F-24 D-5). */
export type PageNotFoundBackTarget =
  | { readonly kind: "section"; readonly section: OwnerSection; readonly href: string }
  | { readonly kind: "dashboard"; readonly href: string };
