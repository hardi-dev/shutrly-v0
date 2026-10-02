import type { ReactNode } from "react";

import type { BookingFieldRecord } from "@/features/booking/application/ports/service-repository/service-repository.port";
import type { CatalogWriteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type { FieldType } from "@/features/booking/domain/booking-field/booking-field.types";

export interface BookingFieldDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly serviceId: string;
  readonly field?: BookingFieldRecord;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (
    workspaceId: string,
    serviceId: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
  readonly updateAction?: (
    workspaceId: string,
    serviceId: string,
    fieldId: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
}

export interface BookingFieldFieldsProps {
  readonly name: string;
  readonly setName: (value: string) => void;
  readonly fieldType: FieldType;
  readonly setFieldType: (value: FieldType) => void;
  readonly required: boolean;
  readonly setRequired: (value: boolean) => void;
  readonly options: readonly string[];
  readonly setOptions: (value: readonly string[]) => void;
  readonly optionErrors: Readonly<Record<number, string>>;
  readonly error?: string;
}

export interface ResponsiveFieldDialogProps extends BookingFieldDialogProps {
  readonly content: ReactNode;
  readonly save: ReactNode;
  readonly title: string;
  readonly description: string;
}

export interface BookingFieldValueState {
  readonly name: string;
  readonly setName: (value: string) => void;
  readonly fieldType: FieldType;
  readonly setFieldType: (value: FieldType) => void;
  readonly required: boolean;
  readonly setRequired: (value: boolean) => void;
  readonly options: readonly string[];
  readonly setOptions: (value: readonly string[]) => void;
}
