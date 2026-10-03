import type { ServiceOptionGroup } from "@/features/booking/application/ports/project-repository/project-repository.port";

export interface ServicePickerProps {
  readonly serviceGroups: readonly ServiceOptionGroup[];
  readonly value: string | null;
  readonly onChange: (serviceId: string) => void;
  readonly errorMessage?: string;
  readonly isDisabled?: boolean;
}
