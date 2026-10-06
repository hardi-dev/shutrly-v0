import type { ClientGalleryReaderPort } from "../../ports/client-gallery-reader/client-gallery-reader.port";
import type { ClientPhotoView } from "../client-views/client-views.types";

export interface GetDeliveryFilesDeps {
  readonly reader: ClientGalleryReaderPort;
  readonly directImages: boolean;
}

/** One finished file as the client sees it, with its same-origin download URL (D-18). */
export interface DeliveryFileView extends ClientPhotoView {
  readonly downloadUrl: string;
}

/** *Hasil akhir*: the finished files by kind (klien-8, BR-DEL-001/002). */
export interface DeliveryFilesView {
  readonly edited: readonly DeliveryFileView[];
  readonly print: readonly DeliveryFileView[];
}
