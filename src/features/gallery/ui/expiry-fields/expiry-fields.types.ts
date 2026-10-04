import type { GalleryExpiryInput } from "@/features/gallery/application/schemas/gallery-expiry/gallery-expiry.types";

export interface ExpiryFieldsProps {
  readonly value: GalleryExpiryInput;
  readonly onChange: (value: GalleryExpiryInput) => void;
  /** Field-error keys from the shared schema or the server. */
  readonly dateError?: string;
  readonly daysError?: string;
  readonly daysHelper: string;
}
