import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** Reads the project's client token for the Owner's *Akses klien* card (D-14 pattern: gallery reads the project row). */
export interface ClientLinkReaderPort {
  /** The token of a project of this workspace, or null (C-101). */
  readonly findToken: (context: WorkspaceContext, projectId: string) => Promise<string | null>;
}
