import type { ClientImage } from "@/features/gallery/application/use-cases/client-views/client-views.types";

export interface PhotoThumbProps {
  readonly image: ClientImage;
  /** 48 px in the note sheet, 56 px in a pick row (pilih-tulis-catatan, tinjau exports). */
  readonly size: "md" | "lg";
}
