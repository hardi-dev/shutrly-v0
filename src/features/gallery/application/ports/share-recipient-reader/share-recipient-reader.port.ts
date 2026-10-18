import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** The client a project's gallery is shared with: the name and the normalised WhatsApp number, or null (BR-CLI-002). */
export interface ShareRecipientRecord {
  readonly name: string;
  readonly whatsappNumber: string | null;
}

/** Reads the project's client for the share dialog. Every call is scoped by the verified workspace (C-101). */
export interface ShareRecipientReaderPort {
  /** The recipient of a project of this workspace, or null when the project is not found. */
  readonly findRecipient: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<ShareRecipientRecord | null>;
}
