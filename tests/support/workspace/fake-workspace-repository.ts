/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  CreateWorkspaceFields,
  WorkspaceProfileUpdate,
  WorkspaceRecord,
  WorkspaceRepositoryPort,
  WorkspaceSummary,
} from "@/features/workspace/application/ports/workspace-repository/workspace-repository.port";
import { asOwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id";
import type { OwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id.types";
import { normaliseWorkspaceName } from "@/features/workspace/domain/workspace-name/workspace-name";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";
import type {
  WorkspaceContext,
  WorkspaceId,
} from "@/shared/workspace-context/workspace-context.types";

export class FakeWorkspaceRepository implements WorkspaceRepositoryPort {
  readonly records: WorkspaceRecord[] = [];

  async countForOwner(owner: OwnerUserId): Promise<number> {
    return this.records.filter((record) => record.ownerUserId === owner).length;
  }

  async create(owner: OwnerUserId, fields: CreateWorkspaceFields) {
    const duplicate = this.records.some(
      (record) =>
        record.ownerUserId === owner &&
        record.name.toLocaleLowerCase("id-ID") === fields.name.toLocaleLowerCase("id-ID"),
    );
    if (duplicate) return { ok: false as const, reason: "DUPLICATE_NAME" as const };
    const id = asWorkspaceId(crypto.randomUUID());
    this.records.push({
      id,
      ownerUserId: owner,
      name: normaliseWorkspaceName(fields.name),
      brandName: null,
      contactEmail: null,
      phone: null,
      address: null,
      invoicePrefix: fields.invoicePrefix,
      currency: fields.currency,
      lastOpenedAt: new Date(),
    });
    return { ok: true as const, id };
  }

  async findForOwner(owner: OwnerUserId, id: WorkspaceId): Promise<WorkspaceSummary | null> {
    const record = this.records.find((item) => item.ownerUserId === owner && item.id === id);
    return record ? { id: record.id, name: record.name } : null;
  }

  async touchIfNotLatest(owner: OwnerUserId, context: WorkspaceContext): Promise<boolean> {
    const target = this.records.find(
      (item) => item.ownerUserId === owner && item.id === context.workspaceId,
    );
    if (!target) return false;
    const latest = Math.max(
      ...this.records
        .filter((item) => item.ownerUserId === owner)
        .map((item) => item.lastOpenedAt.getTime()),
    );
    if (target.lastOpenedAt.getTime() >= latest) return false;
    const index = this.records.indexOf(target);
    this.records[index] = { ...target, lastOpenedAt: new Date() };
    return true;
  }

  async findLastOpened(owner: OwnerUserId): Promise<WorkspaceSummary | null> {
    const record = this.records
      .filter((item) => item.ownerUserId === owner)
      .sort((left, right) => right.lastOpenedAt.getTime() - left.lastOpenedAt.getTime())
      .at(0);
    return record ? { id: record.id, name: record.name } : null;
  }

  async listForOwner(owner: OwnerUserId): Promise<readonly WorkspaceSummary[]> {
    return this.records
      .filter((item) => item.ownerUserId === owner)
      .sort(
        (left, right) =>
          left.name.localeCompare(right.name, "id") || left.id.localeCompare(right.id),
      )
      .map(({ id, name }) => ({ id, name }));
  }

  async getProfile(context: WorkspaceContext): Promise<WorkspaceRecord | null> {
    return this.records.find((item) => item.id === context.workspaceId) ?? null;
  }

  async updateProfile(context: WorkspaceContext, fields: WorkspaceProfileUpdate) {
    const target = this.records.find((item) => item.id === context.workspaceId);
    if (!target) return { ok: false as const, reason: "NOT_FOUND" as const };
    const duplicate = this.records.some(
      (item) =>
        item.id !== target.id &&
        item.ownerUserId === target.ownerUserId &&
        item.name.toLocaleLowerCase("id-ID") === fields.name.toLocaleLowerCase("id-ID"),
    );
    if (duplicate) return { ok: false as const, reason: "DUPLICATE_NAME" as const };
    const index = this.records.indexOf(target);
    this.records[index] = { ...target, ...fields };
    return { ok: true as const };
  }
}

export function fakeOwnerUserId(value = "owner_1"): OwnerUserId {
  return asOwnerUserId(value);
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
