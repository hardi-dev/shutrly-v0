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

/** The finished files of one package item, or of one kind for files without an item (F-20). */
export interface DeliveryGroupView {
  readonly id: string;
  readonly name: string;
  readonly files: readonly DeliveryFileView[];
}

/** *Hasil akhir*: the finished files per package item (klien-8, BR-DEL-001/002, F-20). */
export interface DeliveryFilesView {
  readonly groups: readonly DeliveryGroupView[];
}
