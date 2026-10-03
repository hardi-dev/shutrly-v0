import type {
  BookingValue,
  SnapshotField,
} from "@/features/booking/domain/booking-field-value/booking-field-value.types";

export interface ProjectFieldsCardProps {
  readonly serviceName: string;
  readonly fields: readonly SnapshotField[];
  readonly values: Readonly<Record<string, BookingValue>>;
  readonly errors: Readonly<Record<string, string>>;
  readonly onChange: (key: string, value: BookingValue) => void;
}

export interface BookingFieldRowProps {
  readonly field: SnapshotField;
  readonly value: BookingValue;
  readonly errorMessage?: string;
  readonly onChange: (key: string, value: BookingValue) => void;
}
