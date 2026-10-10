import "server-only";

import { and, eq } from "drizzle-orm";

import type {
  MessageTemplateRecord,
  MessageTemplateRepositoryPort,
} from "@/features/communications/application/ports/message-template-repository/message-template-repository.port";
import { isTemplateType } from "@/features/communications/domain/template-type/template-type";

import type { DbExecutor } from "../client/client.types";
import { messageTemplate } from "../schema/communications/message-template";

const CHANNEL = "WHATSAPP";

interface TemplateRow {
  type: string;
  content: string | null;
  updatedAt: Date;
}

const RECORD_COLUMNS = {
  type: messageTemplate.type,
  content: messageTemplate.content,
  updatedAt: messageTemplate.updatedAt,
};

function toRecords(row: TemplateRow): MessageTemplateRecord[] {
  // The CHECK constraint guarantees a known type; an unknown one is skipped, never guessed.
  if (!isTemplateType(row.type)) return [];
  // A platform default has no stored text until the save modes (I4) write one. Until then no row
  // is null, so a null here means a default reached code that cannot render it yet: fail loudly,
  // never substitute text (D-10, no fallback).
  if (row.content === null) throw new Error("message template default has no content mapper yet");
  return [{ ...row, type: row.type, content: row.content }];
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
        .set({ content: update.content, updatedBy: update.editorUserId, updatedAt: new Date() })
        .where(and(scope(context.workspaceId), eq(messageTemplate.type, update.type)))
        .returning({ id: messageTemplate.id });
      return rows.length > 0;
    },
    async seedDefaults(context, seeds) {
      if (seeds.length === 0) return;
      await db
        .insert(messageTemplate)
        .values(
          seeds.map((seed) => ({
            workspaceId: context.workspaceId,
            type: seed.type,
            channel: CHANNEL,
            content: seed.content,
          })),
        )
        .onConflictDoNothing({
          target: [messageTemplate.workspaceId, messageTemplate.type, messageTemplate.channel],
        });
    },
  };
}
