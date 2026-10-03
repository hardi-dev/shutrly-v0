/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  ClientOption,
  CreateSnapshotResult,
  DefinitionRules,
  FilterClientOption,
  FilterServiceOption,
  MoveStatusResult,
  ProjectDetailRecord,
  ProjectRepositoryPort,
  ProjectSnapshotInput,
  ServiceOptionGroup,
  ServiceSnapshotSource,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { StepTransition } from "@/features/booking/domain/project-status/project-status.types";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface FakeClient {
  readonly id: string;
  readonly name: string;
  readonly whatsappNumber: string | null;
  readonly isArchived: boolean;
}

export interface FakeDefinition extends DefinitionRules {
  readonly name: string;
  readonly unit: string | null;
  readonly selectionType: "EDIT" | "PRINT" | null;
}

export interface FakeServiceRow extends ServiceSnapshotSource {
  readonly categoryId: string;
}

export interface StoredProject {
  readonly id: string;
  readonly workspaceId: string;
  readonly accessToken: string;
  readonly input: ProjectSnapshotInput;
  status: ProjectStatus;
}

export class FakeProjectRepository implements ProjectRepositoryPort {
  readonly clients: FakeClient[] = [];
  readonly definitions: FakeDefinition[] = [];
  readonly services: FakeServiceRow[] = [];
  readonly projects: StoredProject[] = [];
  readonly workspaceId = "projects-workspace";

  async createSnapshot(
    context: WorkspaceContext,
    input: ProjectSnapshotInput,
  ): Promise<CreateSnapshotResult> {
    const client = this.clients.find((row) => row.id === input.clientId);
    const service = this.services.find((row) => row.id === input.serviceId);
    if (context.workspaceId !== this.workspaceId || !client || !service) {
      return { status: "NOT_FOUND" };
    }
    if (client.isArchived) return { status: "CLIENT_INACTIVE" };
    if (!service.isActive) return { status: "SERVICE_INACTIVE" };
    const seen = new Set<string>();
    for (const item of input.items) {
      const definition = this.definitions.find((row) => row.id === item.definitionId);
      if (!definition) return { status: "NOT_FOUND" };
      if (seen.has(item.definitionId)) {
        return { status: "DUPLICATE_DEFINITION", definitionId: item.definitionId };
      }
      seen.add(item.definitionId);
      const inService = service.items.some((row) => row.definitionId === item.definitionId);
      if (!definition.isActive && !inService) {
        return { status: "DEFINITION_INACTIVE", definitionId: item.definitionId };
      }
    }
    const id = `project-${String(this.projects.length + 1)}`;
    this.projects.push({
      id,
      workspaceId: context.workspaceId,
      accessToken: input.accessToken,
      input,
      status: input.status,
    });
    return { status: "CREATED", id };
  }

  async findServiceForSnapshot(context: WorkspaceContext, serviceId: string) {
    if (context.workspaceId !== this.workspaceId) return null;
    return this.services.find((row) => row.id === serviceId) ?? null;
  }

  async findDefinitionRules(
    context: WorkspaceContext,
    ids: readonly string[],
  ): Promise<readonly DefinitionRules[]> {
    if (context.workspaceId !== this.workspaceId) return [];
    return this.definitions.filter((row) => ids.includes(row.id));
  }

  async searchActiveClients(
    context: WorkspaceContext,
    text: string,
    limit: number,
  ): Promise<readonly ClientOption[]> {
    if (context.workspaceId !== this.workspaceId) return [];
    return this.clients
      .filter((row) => !row.isArchived && row.name.toLowerCase().includes(text.toLowerCase()))
      .sort((left, right) => left.name.localeCompare(right.name))
      .slice(0, limit)
      .map((row) => ({
        id: row.id,
        name: row.name,
        whatsappNumber: row.whatsappNumber,
        projectCount: this.projects.filter((project) => project.input.clientId === row.id).length,
      }));
  }

  async findDetail(context: WorkspaceContext, id: string): Promise<ProjectDetailRecord | null> {
    const stored = this.projects.find(
      (row) => row.id === id && row.workspaceId === context.workspaceId,
    );
    if (!stored) return null;
    const client = this.clients.find((row) => row.id === stored.input.clientId);
    const service = this.services.find((row) => row.id === stored.input.serviceId);
    if (!client || !service) return null;
    return {
      id: stored.id,
      title: stored.input.title,
      notes: stored.input.notes,
      agreedPrice: stored.input.agreedPrice,
      currency: "IDR",
      status: stored.status,
      client: { id: client.id, name: client.name, whatsappNumber: client.whatsappNumber },
      service: { id: service.id, name: service.name },
      items: [],
      fields: [],
      sessions: stored.input.sessions.map((session, index) => ({
        ...session,
        id: `session-${String(index)}`,
        createdAt: `2026-10-01T00:00:0${String(index)}Z`,
      })),
      cancellation: null,
    };
  }

  async moveStatus(
    context: WorkspaceContext,
    id: string,
    transition: StepTransition,
  ): Promise<MoveStatusResult> {
    const stored = this.projects.find(
      (row) => row.id === id && row.workspaceId === context.workspaceId,
    );
    if (!stored) return "NOT_FOUND";
    if (stored.status !== transition.from) return "STALE";
    stored.status = transition.to;
    return "MOVED";
  }

  async listServicesForFilter(context: WorkspaceContext): Promise<readonly FilterServiceOption[]> {
    if (context.workspaceId !== this.workspaceId) return [];
    return this.services
      .map((row) => ({ id: row.id, name: row.name, isActive: row.isActive }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  async searchClientsForFilter(
    context: WorkspaceContext,
    text: string,
    limit: number,
  ): Promise<readonly FilterClientOption[]> {
    if (context.workspaceId !== this.workspaceId) return [];
    return this.clients
      .filter((row) => row.name.toLowerCase().includes(text.toLowerCase()))
      .sort((left, right) => left.name.localeCompare(right.name))
      .slice(0, limit)
      .map((row) => ({ id: row.id, name: row.name, isArchived: row.isArchived }));
  }

  async countSessions(context: WorkspaceContext, id: string): Promise<number | null> {
    const stored = this.projects.find(
      (row) => row.id === id && row.workspaceId === context.workspaceId,
    );
    return stored ? stored.input.sessions.length : null;
  }

  async listActiveServiceOptions(
    context: WorkspaceContext,
  ): Promise<readonly ServiceOptionGroup[]> {
    if (context.workspaceId !== this.workspaceId) return [];
    const groups = new Map<string, ServiceOptionGroup>();
    for (const service of this.services.filter((row) => row.isActive)) {
      const group = groups.get(service.categoryId);
      groups.set(service.categoryId, {
        categoryId: service.categoryId,
        categoryName: service.categoryName,
        services: [...(group?.services ?? []), service],
      });
    }
    return [...groups.values()];
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
