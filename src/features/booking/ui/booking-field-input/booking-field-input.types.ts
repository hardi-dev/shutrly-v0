import type {
  BookingValue,
  SnapshotField,
} from "@/features/booking/domain/booking-field-value/booking-field-value.types";

export interface BookingFieldInputProps {
  readonly field: SnapshotField;
  readonly value: BookingValue;
  readonly onChange: (value: BookingValue) => void;
  readonly errorMessage?: string;
}
