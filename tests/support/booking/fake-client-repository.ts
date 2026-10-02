/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  ClientChange,
  ClientPageQuery,
  ClientRecord,
  ClientRepositoryPort,
} from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

interface StoredClient extends ClientRecord {
  readonly workspaceId: string;
  readonly createdAt: number;
  readonly updatedBy: string;
}

export class FakeClientRepository implements ClientRepositoryPort {
  readonly rows: StoredClient[] = [];
  lastListQuery: ClientPageQuery | undefined;
  private createdAt = 0;

  async listPage(
    context: WorkspaceContext,
    query: ClientPageQuery,
  ): Promise<readonly ClientRecord[]> {
    this.lastListQuery = query;
    const rows = this.rows
      .filter((row) => {
        const statusMatches = query.status === "ACTIVE" ? !row.isArchived : row.isArchived;
        const searchMatches =
          !query.search ||
          row.name.toLowerCase().includes(query.search.text.toLowerCase()) ||
          (query.search.digits !== null && row.whatsappNumber?.includes(query.search.digits));
        return row.workspaceId === context.workspaceId && statusMatches && searchMatches;
      })
      .sort(
        (left, right) =>
          left.name.toLowerCase().localeCompare(right.name.toLowerCase()) ||
          left.createdAt - right.createdAt ||
          left.id.localeCompare(right.id),
      );
    const after =
      query.afterId === null ? 0 : rows.findIndex((row) => row.id === query.afterId) + 1;
    return rows.slice(after, after + query.limit);
  }

  async count(context: WorkspaceContext, status: "ACTIVE" | "ARCHIVED"): Promise<number> {
    return this.rows.filter(
      (row) =>
        row.workspaceId === context.workspaceId &&
        (status === "ACTIVE" ? !row.isArchived : row.isArchived),
    ).length;
  }

  async create(context: WorkspaceContext, change: ClientChange) {
    const holder =
      change.whatsappNumber === null
        ? undefined
        : this.rows.find(
            (row) =>
              row.workspaceId === context.workspaceId &&
              row.whatsappNumber === change.whatsappNumber,
          );
    if (holder)
      return {
        status: "NUMBER_TAKEN",
        holder: { name: holder.name, isArchived: holder.isArchived },
      } as const;
    this.rows.push({
      id: crypto.randomUUID(),
      workspaceId: context.workspaceId,
      name: change.name,
      whatsappNumber: change.whatsappNumber,
      socialLinks: change.socialLinks,
      isArchived: false,
      updatedBy: change.editorUserId,
      createdAt: this.createdAt++,
    });
    return { status: "CREATED" } as const;
  }

  async update(context: WorkspaceContext, id: string, change: ClientChange) {
    const row = this.rows.find(
      (candidate) => candidate.workspaceId === context.workspaceId && candidate.id === id,
    );
    if (!row) return "NOT_FOUND" as const;
    const holder =
      change.whatsappNumber === null
        ? undefined
        : this.rows.find(
            (candidate) =>
              candidate.workspaceId === context.workspaceId &&
              candidate.id !== id &&
              candidate.whatsappNumber === change.whatsappNumber,
          );
    if (holder)
      return {
        status: "NUMBER_TAKEN",
        holder: { name: holder.name, isArchived: holder.isArchived },
      } as const;
    const index = this.rows.indexOf(row);
    this.rows[index] = {
      ...row,
      name: change.name,
      whatsappNumber: change.whatsappNumber,
      socialLinks: change.socialLinks,
      updatedBy: change.editorUserId,
    };
    return "UPDATED" as const;
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
