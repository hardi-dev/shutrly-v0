import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** What the Owner's selection views need about the project beyond its groups (A-34). */
export interface SelectionOwnerFacts {
  readonly projectTitle: string;
  /** Whether the project has a gallery yet (the card links to it). */
  readonly galleryExists: boolean;
  /** Selection items in the package, whether or not their groups exist yet (BR-SEL-001). */
  readonly selectionItemCount: number;
}

export interface SelectionOwnerReaderPort {
  /** The facts of a project of this workspace, or null for another workspace's project (C-101). */
  readonly findFacts: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<SelectionOwnerFacts | null>;
}
