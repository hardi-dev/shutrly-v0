import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientInput } from "@/features/booking/application/schemas/client-input/client-input.types";
import type {
  ClientWriteResult,
  CreatedClient,
} from "@/features/booking/application/use-cases/client-results/client-results.types";

export interface ClientDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly mode?: "add" | "edit";
  readonly client?: ClientRecord;
  /** Add mode: prefills *Nama klien* (the picker's query). */
  readonly initialName?: string;
  /** Replaces the add description, e.g. on Proyek baru. */
  readonly description?: string;
  /** Called with the new client after a successful add. */
  readonly onCreated?: (client: CreatedClient) => void;
  readonly onSubmit: (
    workspaceId: string,
    values: ClientInput,
  ) => Promise<ClientWriteResult | undefined>;
}
