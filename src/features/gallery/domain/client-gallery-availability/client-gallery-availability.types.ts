export interface AvailabilityInput {
  readonly projectStatus: string;
  readonly galleryStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  readonly expiresAt: Date | null;
  readonly now: Date;
}
