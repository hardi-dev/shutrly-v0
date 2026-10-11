import type { useTranslations } from "next-intl";

import type {
  DeliveryFilesView,
  DeliveryFileView,
} from "@/features/gallery/application/use-cases/get-delivery-files/get-delivery-files.types";
import type { ClientGateView } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

import type { DeliveryScreenState } from "../use-delivery-screen/use-delivery-screen.types";

export interface DeliveryScreenProps {
  readonly gate: ClientGateView;
  readonly token: string;
  readonly files: DeliveryFilesView;
}

export interface DeliveryPartProps {
  readonly screen: DeliveryScreenState;
}

export interface DeliveryFileTileProps {
  readonly file: DeliveryFileView;
  readonly index: number;
  readonly screen: DeliveryScreenState;
}

/** The delivery screen translate function, passed into helpers that run outside a component. */
export type DeliveryScreenTranslate = ReturnType<typeof useTranslations>;
