import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { DeleteClientResult } from "@/features/booking/application/use-cases/delete-client/delete-client.types";

export interface DeleteClientDialogProps {
  readonly client: ClientRecord | null;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (workspaceId: string, clientId: string) => Promise<DeleteClientResult>;
}
