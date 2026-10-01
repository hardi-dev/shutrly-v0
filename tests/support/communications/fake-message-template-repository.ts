/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  MessageTemplateRecord,
  MessageTemplateRepositoryPort,
  MessageTemplateSeed,
  MessageTemplateUpdate,
} from "@/features/communications/application/ports/message-template-repository/message-template-repository.port";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

interface StoredTemplate extends MessageTemplateRecord {
  readonly workspaceId: string;
  readonly updatedBy: string | null;
}

export class FakeMessageTemplateRepository implements MessageTemplateRepositoryPort {
  readonly rows: StoredTemplate[] = [];

  async listForWorkspace(context: WorkspaceContext): Promise<readonly MessageTemplateRecord[]> {
    return this.rows.filter((row) => row.workspaceId === context.workspaceId);
  }

  async findByType(context: WorkspaceContext, type: TemplateType) {
    return (
      this.rows.find((row) => row.workspaceId === context.workspaceId && row.type === type) ?? null
    );
  }

  async updateContent(context: WorkspaceContext, update: MessageTemplateUpdate) {
    const index = this.rows.findIndex(
      (row) => row.workspaceId === context.workspaceId && row.type === update.type,
    );
    if (index === -1) return false;
    this.rows[index] = {
      ...this.rows[index],
      content: update.content,
      updatedBy: update.editorUserId,
      updatedAt: new Date(),
    };
    return true;
  }

  async seedDefaults(context: WorkspaceContext, seeds: readonly MessageTemplateSeed[]) {
    for (const seed of seeds) {
      if (await this.findByType(context, seed.type)) continue;
      this.rows.push({
        workspaceId: context.workspaceId,
        type: seed.type,
        content: seed.content,
        updatedBy: null,
        updatedAt: new Date(),
      });
    }
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
