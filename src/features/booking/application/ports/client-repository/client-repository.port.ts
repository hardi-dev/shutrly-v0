import "server-only";

import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";
import type { ClientSearch } from "@/features/booking/domain/client-search/client-search.types";
import type { SocialLink } from "@/features/booking/domain/social-link/social-link.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ClientFields } from "../../schemas/client-input/client-input.types";

export interface ClientRecord {
  readonly id: string;
  readonly name: string;
  readonly whatsappNumber: string | null;
  readonly socialLinks: readonly SocialLink[];
  readonly isArchived: boolean;
}

export interface ClientPageQuery {
  readonly status: ClientStatus;
  readonly search: ClientSearch | null;
  /** Keyset cursor: the last row already shown; null for the first page (D-4). */
  readonly afterId: string | null;
  readonly limit: number;
}

export interface ClientChange extends ClientFields {
  readonly editorUserId: string;
}

export interface NumberHolder {
  readonly name: string;
  readonly isArchived: boolean;
}

export type NumberTaken = { readonly status: "NUMBER_TAKEN"; readonly holder: NumberHolder };

/** Every call is scoped by the verified workspace (C-101). */
export interface ClientRepositoryPort {
  readonly listPage: (
    context: WorkspaceContext,
    query: ClientPageQuery,
  ) => Promise<readonly ClientRecord[]>;
  readonly count: (context: WorkspaceContext, status: ClientStatus) => Promise<number>;
  readonly create: (
    context: WorkspaceContext,
    change: ClientChange,
  ) => Promise<{ readonly status: "CREATED" } | NumberTaken>;
  readonly update: (
    context: WorkspaceContext,
    id: string,
    change: ClientChange,
  ) => Promise<"UPDATED" | "NOT_FOUND" | NumberTaken>;
}
