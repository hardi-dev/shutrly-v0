import "server-only";

import { and, eq } from "drizzle-orm";

import type {
  MessageTemplateRecord,
  MessageTemplateRepositoryPort,
  MessageTemplateSeed,
} from "@/features/communications/application/ports/message-template-repository/message-template-repository.port";
import { isTemplateType } from "@/features/communications/domain/template-type/template-type";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { messageTemplate } from "../schema/communications/message-template";

const CHANNEL = "WHATSAPP";

interface TemplateRow {
  type: string;
  isDefault: boolean;
  content: string | null;
  updatedAt: Date;
}

const RECORD_COLUMNS = {
  type: messageTemplate.type,
  isDefault: messageTemplate.isDefault,
  content: messageTemplate.content,
  updatedAt: messageTemplate.updatedAt,
};

function toRecords(row: TemplateRow): MessageTemplateRecord[] {
  // The CHECK constraint guarantees a known type; an unknown one is skipped, never guessed.
  if (!isTemplateType(row.type)) return [];
  return [{ ...row, type: row.type }];
}

/** A platform default row: `is_default = true` with no text (D-12, D-13). */
function seedRow(context: WorkspaceContext, seed: MessageTemplateSeed) {
  return {
    workspaceId: context.workspaceId,
    type: seed.type,
    channel: CHANNEL,
    isDefault: true,
    content: null,
  };
}

/**
 * Creates the Drizzle message-template repository; every query is scoped by the verified
 * workspace and the WhatsApp channel (C-101, BR-MSG-002).
 * @param db - the request database or a transaction (ADR-016)
 * @returns the message-template repository port
 */
export function createDrizzleMessageTemplateRepository(
  db: DbExecutor,
): MessageTemplateRepositoryPort {
  const scope = (workspaceId: string) =>
    and(eq(messageTemplate.workspaceId, workspaceId), eq(messageTemplate.channel, CHANNEL));
  return {
    async listForWorkspace(context) {
      const rows = await db
        .select(RECORD_COLUMNS)
        .from(messageTemplate)
        .where(scope(context.workspaceId));
      return rows.flatMap(toRecords);
    },
    async findByType(context, type) {
      const rows = await db
        .select(RECORD_COLUMNS)
        .from(messageTemplate)
        .where(and(scope(context.workspaceId), eq(messageTemplate.type, type)));
      return rows.flatMap(toRecords).at(0) ?? null;
    },
    async updateContent(context, update) {
      const rows = await db
        .update(messageTemplate)
        .set({
          isDefault: update.isDefault,
          content: update.content,
          updatedBy: update.editorUserId,
          updatedAt: new Date(),
        })
        .where(and(scope(context.workspaceId), eq(messageTemplate.type, update.type)))
        .returning({ id: messageTemplate.id });
      return rows.length > 0;
    },
    async seedDefaults(context, seeds) {
      if (seeds.length === 0) return;
      await db
        .insert(messageTemplate)
        .values(seeds.map((seed) => seedRow(context, seed)))
        .onConflictDoNothing({
          target: [messageTemplate.workspaceId, messageTemplate.type, messageTemplate.channel],
        });
    },
  };
}
