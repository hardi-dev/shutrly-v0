/* eslint-disable @typescript-eslint/require-await -- the fakes mirror the asynchronous repository ports */

import type { ArchiveChange } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type {
  AddAssignmentResult,
  AssignmentChange,
  SessionAssignmentRepositoryPort,
} from "@/features/booking/application/ports/session-assignment-repository/session-assignment-repository.port";
import type {
  AssignableMember,
  TeamMemberChange,
  TeamMemberPageQuery,
  TeamMemberRecord,
  TeamMemberRepositoryPort,
} from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
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

interface StoredMember {
  readonly id: string;
  readonly workspaceId: string;
  name: string;
  whatsappNumber: string;
  email: string | null;
  roleIds: readonly string[];
  archived: boolean;
}

/** In-memory member repository; `roles` is the role catalogue the fake validates role IDs against. */
export class FakeTeamMemberRepository implements TeamMemberRepositoryPort {
  readonly rows: StoredMember[] = [];
  /** IDs of members with an assignment, standing in for `session_assignment`. */
  readonly assigned = new Set<string>();
  readonly roles = new Map<string, { workspaceId: string; name: string }>();

  private record(row: StoredMember): TeamMemberRecord {
    return {
      id: row.id,
      name: row.name,
      whatsappNumber: row.whatsappNumber,
      email: row.email,
      roles: row.roleIds.map((id) => ({ id, name: this.roles.get(id)?.name ?? "" })),
      isArchived: row.archived,
    };
  }

  private holder(context: WorkspaceContext, number: string, exceptId?: string) {
    return this.rows.find(
      (row) =>
        row.workspaceId === context.workspaceId &&
        row.whatsappNumber === number &&
        row.id !== exceptId,
    );
  }

  private rolesExist(context: WorkspaceContext, roleIds: readonly string[]) {
    return roleIds.every((id) => this.roles.get(id)?.workspaceId === context.workspaceId);
  }

  async listPage(context: WorkspaceContext, query: TeamMemberPageQuery) {
    const matches = this.rows
      .filter((row) => row.workspaceId === context.workspaceId)
      .filter((row) => row.archived === (query.status === "ARCHIVED"))
      .filter((row) => !query.search || this.matches(row, query))
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    const start = query.afterId ? matches.findIndex((row) => row.id === query.afterId) + 1 : 0;
    return matches.slice(start, start + query.limit).map((row) => this.record(row));
  }

  private matches(row: StoredMember, query: TeamMemberPageQuery) {
    const search = query.search;
    if (!search) return true;
    return (
      row.name.toLowerCase().includes(search.text.toLowerCase()) ||
      (search.digits !== null && row.whatsappNumber.includes(search.digits))
    );
  }

  async count(context: WorkspaceContext, status: "ACTIVE" | "ARCHIVED") {
    return this.rows.filter(
      (row) => row.workspaceId === context.workspaceId && row.archived === (status === "ARCHIVED"),
    ).length;
  }

  async create(context: WorkspaceContext, change: TeamMemberChange) {
    if (!this.rolesExist(context, change.roleIds)) return "NOT_FOUND" as const;
    const holder = this.holder(context, change.whatsappNumber);
    if (holder) {
      return {
        status: "NUMBER_TAKEN",
        holder: { name: holder.name, isArchived: holder.archived },
      } as const;
    }
    const id = crypto.randomUUID();
    this.rows.push({
      id,
      workspaceId: context.workspaceId,
      name: change.name,
      whatsappNumber: change.whatsappNumber,
      email: change.email,
      roleIds: change.roleIds,
      archived: false,
    });
    return { status: "CREATED", id } as const;
  }

  async update(context: WorkspaceContext, id: string, change: TeamMemberChange) {
    const row = this.rows.find((r) => r.workspaceId === context.workspaceId && r.id === id);
    if (!row || !this.rolesExist(context, change.roleIds)) return "NOT_FOUND" as const;
    const holder = this.holder(context, change.whatsappNumber, id);
    if (holder) {
      return {
        status: "NUMBER_TAKEN",
        holder: { name: holder.name, isArchived: holder.archived },
      } as const;
    }
    Object.assign(row, {
      name: change.name,
      whatsappNumber: change.whatsappNumber,
      email: change.email,
      roleIds: change.roleIds,
    });
    return "UPDATED" as const;
  }

  async setArchived(context: WorkspaceContext, change: ArchiveChange) {
    const row = this.rows.find((r) => r.workspaceId === context.workspaceId && r.id === change.id);
    if (!row) return false;
    row.archived = change.isArchived;
    return true;
  }

  async listAssignable(context: WorkspaceContext): Promise<readonly AssignableMember[]> {
    return this.rows
      .filter((row) => row.workspaceId === context.workspaceId && !row.archived)
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      .map((row) => ({ id: row.id, name: row.name, roles: this.record(row).roles }));
  }

  async delete(context: WorkspaceContext, id: string) {
    const index = this.rows.findIndex((r) => r.workspaceId === context.workspaceId && r.id === id);
    if (index < 0) return "NOT_FOUND" as const;
    if (this.assigned.has(id)) return "HAS_ASSIGNMENTS" as const;
    this.rows.splice(index, 1);
    return "DELETED" as const;
  }
}

/** In-memory assignment repository: it answers with the result its test queues. */
export class FakeSessionAssignmentRepository implements SessionAssignmentRepositoryPort {
  readonly calls: AssignmentChange[] = [];
  result: AddAssignmentResult = "ADDED";

  async add(_context: WorkspaceContext, change: AssignmentChange) {
    this.calls.push(change);
    return this.result;
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
