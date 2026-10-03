export const COMING_SOON_SECTIONS = ["invoices", "team", "search", "notifications"] as const;

export type ComingSoonSection = (typeof COMING_SOON_SECTIONS)[number];

/** Checks whether a route segment is one of the F-02 placeholder destinations. @param section - the route segment @returns whether the segment is supported as a coming-soon page */
export function isComingSoonSection(section: string): section is ComingSoonSection {
  return COMING_SOON_SECTIONS.some((candidate) => candidate === section);
}
