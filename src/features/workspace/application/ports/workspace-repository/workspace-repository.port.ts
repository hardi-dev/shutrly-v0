import "server-only";

import type { InvoicePrefix } from "@/features/workspace/domain/invoice-prefix/invoice-prefix.types";
import type { OwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id.types";
import type { WorkspaceName } from "@/features/workspace/domain/workspace-name/workspace-name.types";
import type { WorkspaceProfile } from "@/features/workspace/domain/workspace-profile/workspace-profile.types";
import type {
  WorkspaceContext,
  WorkspaceId,
} from "@/shared/workspace-context/workspace-context.types";

export interface WorkspaceSummary {
  readonly id: WorkspaceId;
  readonly name: string;
}

export interface WorkspaceRecord extends WorkspaceProfile {
  readonly id: WorkspaceId;
  readonly ownerUserId: OwnerUserId;
  readonly invoicePrefix: InvoicePrefix;
  readonly currency: "IDR";
  readonly lastOpenedAt: Date;
}

export interface CreateWorkspaceFields {
  readonly name: WorkspaceName;
  readonly invoicePrefix: InvoicePrefix;
  readonly currency: "IDR";
}

export interface WorkspaceProfileUpdate {
  readonly name: WorkspaceName;
  readonly brandName: string | null;
  readonly contactEmail: string | null;
  readonly phone: string | null;
  readonly address: string | null;
  readonly invoicePrefix: InvoicePrefix;
}

export interface WorkspaceRepositoryPort {
  readonly countForOwner: (owner: OwnerUserId) => Promise<number>;
  readonly create: (
    owner: OwnerUserId,
    fields: CreateWorkspaceFields,
  ) => Promise<
    | { readonly ok: true; readonly id: WorkspaceId }
    | { readonly ok: false; readonly reason: "DUPLICATE_NAME" }
  >;
  readonly findForOwner: (owner: OwnerUserId, id: WorkspaceId) => Promise<WorkspaceSummary | null>;
  readonly touchIfNotLatest: (owner: OwnerUserId, context: WorkspaceContext) => Promise<boolean>;
  readonly findLastOpened: (owner: OwnerUserId) => Promise<WorkspaceSummary | null>;
  readonly listForOwner: (owner: OwnerUserId) => Promise<readonly WorkspaceSummary[]>;
  readonly getProfile: (context: WorkspaceContext) => Promise<WorkspaceRecord | null>;
  readonly updateProfile: (
    context: WorkspaceContext,
    fields: WorkspaceProfileUpdate,
  ) => Promise<
    { readonly ok: true } | { readonly ok: false; readonly reason: "DUPLICATE_NAME" | "NOT_FOUND" }
  >;
}
