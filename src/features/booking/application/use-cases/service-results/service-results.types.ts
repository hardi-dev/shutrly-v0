import type {
  ServiceDetailRecord,
  ServiceItemRecord,
  ServiceSummaryRecord,
} from "../../ports/service-repository/service-repository.port";
import type { CatalogValidationFailure } from "../catalog-results/catalog-results.types";

export type ServiceWriteResult =
  { readonly ok: true; readonly serviceId?: string } | CatalogValidationFailure;

export type ServiceItemWriteResult = { readonly ok: true } | CatalogValidationFailure;
export type BookingFieldWriteResult = { readonly ok: true } | CatalogValidationFailure;

export interface ServiceListItem extends ServiceSummaryRecord {
  readonly priceLabel: string;
  readonly summary: string;
}

export interface ServiceListGroup {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly isActive: boolean;
  readonly services: readonly ServiceListItem[];
}

export interface ServiceDetailView extends ServiceDetailRecord {
  readonly priceLabel: string;
  readonly summary: string;
}

export interface ServiceItemView extends ServiceItemRecord {
  readonly summary: string;
}
