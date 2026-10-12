import "server-only";

import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface MessageTemplateRecord {
  readonly type: TemplateType;
  /** True when the platform default is shown; `content` is then null (D-12, D-13). */
  readonly isDefault: boolean;
  readonly content: string | null;
  readonly updatedAt: Date;
}

/** A platform default: stored as `is_default = true, content = NULL`. */
export interface MessageTemplateSeed {
  readonly type: TemplateType;
}

export interface MessageTemplateUpdate {
  readonly type: TemplateType;
  readonly isDefault: boolean;
  readonly content: string | null;
  readonly editorUserId: string;
}

// Every call is scoped by the verified workspace (C-101); the channel is always WHATSAPP.
export interface MessageTemplateRepositoryPort {
  readonly listForWorkspace: (
    context: WorkspaceContext,
  ) => Promise<readonly MessageTemplateRecord[]>;
  readonly findByType: (
    context: WorkspaceContext,
    type: TemplateType,
  ) => Promise<MessageTemplateRecord | null>;
  /** Returns false when the workspace has no template of that type. */
  readonly updateContent: (
    context: WorkspaceContext,
    update: MessageTemplateUpdate,
  ) => Promise<boolean>;
  /** Inserts the missing types only (idempotent, BR-MSG-005). */
  readonly seedDefaults: (
    context: WorkspaceContext,
    seeds: readonly MessageTemplateSeed[],
  ) => Promise<void>;
}
