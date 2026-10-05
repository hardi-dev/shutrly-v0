// ADR-019 point 3, TD D-22: Google serves link-shared Drive images by file ID; the URL form is
// undocumented, so every caller keeps the Owner media route as its fallback.
export const GOOGLE_IMAGE_BASE = "https://lh3.googleusercontent.com/d";
export const GOOGLE_IMAGE_WIDTHS = { tile: 600, preview: 1600 } as const;

const FILE_ID = /^[A-Za-z0-9_-]{10,200}$/;

/** Builds the Google image URL of a Drive file at a width, or null when the ID isn't a Drive file ID (so a malformed ID never reaches a URL). @param externalFileId - the Drive file ID @param width - the image width in pixels @returns the URL, or null */
export function googleImageUrl(externalFileId: string, width: number): string | null {
  return FILE_ID.test(externalFileId)
    ? `${GOOGLE_IMAGE_BASE}/${externalFileId}=w${String(width)}`
    : null;
}
