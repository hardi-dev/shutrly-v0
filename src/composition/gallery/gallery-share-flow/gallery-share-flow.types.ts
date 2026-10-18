/** The share dialog's entry: the rendered message and the deep link, or a refusal with a stable code (AC-GFL-021, 025). */
export type GalleryShareEntry =
  | {
      readonly ok: true;
      /** The client's name and the display form of the number, or null without a number. */
      readonly recipient: { readonly name: string; readonly phone: string | null };
      /** The `GALLERY_SHARE` text in the Owner's active language, with the password. */
      readonly text: string;
      /** The `wa.me` deep link with the text prefilled, or null without a number (AC-GFL-024). */
      readonly waUrl: string | null;
    }
  | { readonly ok: false; readonly code: "NOT_SHAREABLE" | "NOT_FOUND" | "FAILED" };
