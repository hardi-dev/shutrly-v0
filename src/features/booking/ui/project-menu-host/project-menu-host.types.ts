import type { ReactNode } from "react";

import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientInput } from "@/features/booking/application/schemas/client-input/client-input.types";
import type { ClientWriteResult } from "@/features/booking/application/use-cases/client-results/client-results.types";
import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";

import type {
  ProjectInfoTarget,
  UpdateProjectInfoCall,
} from "../project-info-dialog/project-info-dialog.types";
import type {
  CancelProjectCall,
  DeleteDraftCall,
} from "../project-status-dialogs/project-status-dialogs.types";
import type { AdvanceProjectCall } from "../use-project-actions/use-project-actions.types";

export interface ProjectMenuTarget {
  readonly id: string;
  readonly title: string;
  readonly status: ProjectStatus;
  /** D-14: passed on to the draft delete confirmation. */
  readonly hasTeam?: boolean;
  readonly clientId: string;
  readonly clientName: string;
  readonly whatsappNumber: string | null;
  /** The phone sheet's meta line, e.g. "Rina · 10 Nov 2026 · Dibooking". */
  readonly meta: string;
  /** When the caller already has the project's info, the dialog opens without a fetch. */
  readonly info?: ProjectInfoTarget;
}

export interface ProjectMenuActions {
  readonly advanceAction: AdvanceProjectCall;
  readonly updateInfoAction: UpdateProjectInfoCall;
  readonly cancelAction: CancelProjectCall;
  readonly deleteDraftAction: DeleteDraftCall;
  readonly loadDetailAction: (workspaceId: string, projectId: string) => Promise<ProjectDetailView>;
  readonly loadClientAction: (workspaceId: string, clientId: string) => Promise<ClientRecord>;
  readonly updateClientAction: (
    workspaceId: string,
    clientId: string,
    values: ClientInput,
  ) => Promise<ClientWriteResult | undefined>;
}

export interface ProjectMenuApi {
  readonly menuFor: (target: ProjectMenuTarget) => ReactNode;
  /** Opens Ubah info for a target (the Info card's button). */
  readonly openInfo: (target: ProjectMenuTarget) => void;
}

export interface ProjectMenuHostProps {
  readonly workspaceId: string;
  readonly actions: ProjectMenuActions;
  readonly variant: "row" | "detail";
  /** Where to go after a draft is deleted; the list only refreshes. */
  readonly onDeleted: () => void;
  /** Called when *Konfirmasi booking* finds no session (the detail page opens Tambah sesi). */
  readonly onSessionRequired?: () => void;
  readonly children: (api: ProjectMenuApi) => ReactNode;
}

export type OpenDialog =
  | { readonly kind: "cancel"; readonly target: ProjectMenuTarget }
  | { readonly kind: "delete"; readonly target: ProjectMenuTarget }
  | { readonly kind: "info"; readonly info: ProjectInfoTarget }
  | { readonly kind: "number"; readonly client: ClientRecord }
  | null;
