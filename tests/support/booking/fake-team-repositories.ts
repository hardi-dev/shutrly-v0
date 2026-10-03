/* eslint-disable @typescript-eslint/require-await -- the fakes mirror the asynchronous repository ports */

import type {
  TeamRoleRecord,
  TeamRoleRepositoryPort,
} from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

interface StoredRole {
  readonly id: string;
  readonly workspaceId: string;
  name: string;
}

export class FakeTeamRoleRepository implements TeamRoleRepositoryPort {
  readonly rows: StoredRole[] = [];
  /** Usage by role ID, standing in for member roles and assignments. */
  readonly usage = new Map<string, number>();

  private find(context: WorkspaceContext, name: string) {
    return this.rows.find(
      (row) =>
        row.workspaceId === context.workspaceId && row.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async list(context: WorkspaceContext): Promise<readonly TeamRoleRecord[]> {
    return this.rows
      .filter((row) => row.workspaceId === context.workspaceId)
      .map((row) => ({ id: row.id, name: row.name, usage: this.usage.get(row.id) ?? 0 }))
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }

  async create(context: WorkspaceContext, name: string) {
    if (this.find(context, name)) return { status: "DUPLICATE" } as const;
    const id = crypto.randomUUID();
    this.rows.push({ id, workspaceId: context.workspaceId, name });
    return { status: "CREATED", id } as const;
  }

  async rename(context: WorkspaceContext, id: string, name: string) {
    const row = this.rows.find((r) => r.workspaceId === context.workspaceId && r.id === id);
    if (!row) return "NOT_FOUND" as const;
    const other = this.find(context, name);
    if (other && other.id !== id) return { status: "DUPLICATE" } as const;
    row.name = name;
    return "UPDATED" as const;
  }

  async delete(context: WorkspaceContext, id: string) {
    const index = this.rows.findIndex((r) => r.workspaceId === context.workspaceId && r.id === id);
    if (index < 0) return "NOT_FOUND" as const;
    const usage = this.usage.get(id) ?? 0;
    if (usage > 0) return { status: "IN_USE", usage } as const;
    this.rows.splice(index, 1);
    return "DELETED" as const;
  }

  async seedDefaults(context: WorkspaceContext, names: readonly string[]) {
    for (const name of names) {
      if (!this.find(context, name))
        this.rows.push({ id: crypto.randomUUID(), workspaceId: context.workspaceId, name });
    }
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
