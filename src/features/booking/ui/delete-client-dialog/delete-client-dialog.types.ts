import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { DeleteClientResult } from "@/features/booking/application/use-cases/delete-client/delete-client.types";

export interface DeleteClientDialogProps {
  readonly client: ClientRecord | null;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (workspaceId: string, clientId: string) => Promise<DeleteClientResult>;
}

export interface DeleteState {
  readonly pending: boolean;
  readonly blocked: boolean;
  readonly title: string;
  readonly description: string;
  readonly close: () => void;
  readonly confirm: () => void;
}

export interface DeleteViewProps {
  readonly state: DeleteState;
  readonly onOpenChange: (isOpen: boolean) => void;
}
