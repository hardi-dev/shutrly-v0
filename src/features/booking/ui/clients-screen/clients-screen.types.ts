/* eslint-disable max-len -- action signature is intentionally explicit at the screen boundary */
import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientInput } from "@/features/booking/application/schemas/client-input/client-input.types";
import type { ClientWriteResult } from "@/features/booking/application/use-cases/client-results/client-results.types";
import type { DeleteClientResult } from "@/features/booking/application/use-cases/delete-client/delete-client.types";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientsScreenProps {
  readonly workspaceId: string;
  readonly status: ClientStatus;
  readonly count: number;
  readonly rows: readonly ClientRecord[];
  readonly q?: string;
  readonly addAction?: (
    workspaceId: string,
    values: ClientInput,
  ) => Promise<ClientWriteResult | undefined>;
  readonly updateAction?: (
    workspaceId: string,
    clientId: string,
    values: ClientInput,
  ) => Promise<ClientWriteResult | undefined>;
  readonly setArchivedAction?: (workspaceId: string, clientId: string, isArchived: boolean) => Promise<void>;
  readonly deleteAction?: (workspaceId: string, clientId: string) => Promise<DeleteClientResult>;
}

export interface ClientScreenContentProps {
  readonly workspaceId: string;
  readonly status: ClientsScreenProps["status"];
  readonly count: number;
  readonly rows: ClientsScreenProps["rows"];
  readonly isMobile: boolean;
  readonly desktopAddAction: ReactNode;
  readonly mobileAddAction: ReactNode;
  readonly emptyState: ReactNode;
  readonly q: string;
  readonly updateAction: ClientsScreenProps["updateAction"];
  readonly openEdit: (client: ClientsScreenProps["rows"][number]) => void;
  readonly addAction: ClientsScreenProps["addAction"];
  readonly isDialogOpen: boolean;
  readonly editing: ClientsScreenProps["rows"][number] | undefined;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly setArchivedAction: ClientsScreenProps["setArchivedAction"];
  readonly deleteAction: ClientsScreenProps["deleteAction"];
  readonly openDelete: (client: ClientRecord) => void;
}

export interface ClientAddDialogProps {
  readonly addAction: ClientsScreenProps["addAction"];
  readonly updateAction: ClientsScreenProps["updateAction"];
  readonly isDialogOpen: boolean;
  readonly editing: ClientsScreenProps["rows"][number] | undefined;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
}
/* eslint-enable max-len -- end explicit action signature */
import type { ReactNode } from "react";
