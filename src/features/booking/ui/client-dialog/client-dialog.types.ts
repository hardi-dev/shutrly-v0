import type { ClientInput } from "@/features/booking/application/schemas/client-input/client-input.types";
import type { ClientWriteResult } from "@/features/booking/application/use-cases/client-results/client-results.types";

export interface ClientDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly onSubmit: (
    workspaceId: string,
    values: ClientInput,
  ) => Promise<ClientWriteResult | undefined>;
}
