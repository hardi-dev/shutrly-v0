/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  ActiveDefinition,
  ClientOption,
  CreateSnapshotResult,
  DefinitionRules,
  FilterClientOption,
  FilterServiceOption,
  LockedProject,
  MoveStatusResult,
  ProjectDetailRecord,
  ProjectFieldRecord,
  ProjectItemRecord,
  ProjectRepositoryPort,
  ProjectSnapshotInput,
  ProjectWriter,
  ServiceOptionGroup,
  ServiceSnapshotSource,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { StepTransition } from "@/features/booking/domain/project-status/project-status.types";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import { compareSessions } from "@/features/booking/domain/session/session";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";
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
  input: ProjectSnapshotInput;
  items: ProjectItemRecord[];
  fields: ProjectFieldRecord[];
  sessions: SessionRecordShape[];
  status: ProjectStatus;
  cancellation: { at: string; byName: string | null; reason: string | null } | null;
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
      items: input.items.map((item, index) => this.itemRecord(id, index, item)),
      fields: service.fields.map((field) => ({
        ...field,
        id: `${id}-field-${field.key}`,
        value: input.fieldValues[field.key] ?? null,
      })),
      sessions: input.sessions.map((session, index) => ({
        ...session,
        id: `${id}-session-${String(index)}`,
        createdAt: `2026-10-01T00:00:0${String(index)}Z`,
      })),
      status: input.status,
      cancellation: null,
    });
    return { status: "CREATED", id };
  }

  itemRecord(projectId: string, index: number, item: ProjectSnapshotInput["items"][number]) {
    const definition = this.definitions.find((row) => row.id === item.definitionId);
    return {
      id: `${projectId}-item-${item.definitionId}`,
      definitionId: item.definitionId,
      name: definition?.name ?? "",
      unit: definition?.unit ?? null,
      valueType: definition?.valueType ?? "NUMBER",
      selectionRequired: definition?.selectionRequired ?? false,
      selectionType: definition?.selectionType ?? null,
      value: item.value,
      order: index,
    } satisfies ProjectItemRecord & { order: number };
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
      service: { id: service.id, name: service.name, basePrice: service.basePrice },
      items: stored.items,
      fields: stored.fields,
      sessions: [...stored.sessions].sort(compareSessions),
      cancellation: stored.cancellation,
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

  async listActiveDefinitions(context: WorkspaceContext): Promise<readonly ActiveDefinition[]> {
    if (context.workspaceId !== this.workspaceId) return [];
    return this.definitions
      .filter((row) => row.isActive)
      .map((row) => ({
        id: row.id,
        name: row.name,
        unit: row.unit,
        valueType: row.valueType,
        selectionRequired: row.selectionRequired,
        selectionType: row.selectionType,
      }));
  }

  async findFilterClient(
    context: WorkspaceContext,
    id: string,
  ): Promise<FilterClientOption | null> {
    if (context.workspaceId !== this.workspaceId) return null;
    const found = this.clients.find((row) => row.id === id);
    return found ? { id: found.id, name: found.name, isArchived: found.isArchived } : null;
  }

  async withLockedProject<T>(
    context: WorkspaceContext,
    id: string,
    change: (locked: LockedProject, writer: ProjectWriter) => Promise<T>,
  ): Promise<T | "NOT_FOUND"> {
    const stored = this.projects.find(
      (row) => row.id === id && row.workspaceId === context.workspaceId,
    );
    if (!stored) return "NOT_FOUND";
    const locked = {
      status: stored.status,
      agreedPrice: stored.input.agreedPrice,
      title: stored.input.title,
      sessionCount: stored.sessions.length,
    };
    const writer: ProjectWriter = {
      updateInfo: async (input) => {
        stored.input = {
          ...stored.input,
          title: input.title,
          notes: input.notes,
          agreedPrice: input.agreedPrice,
        };
      },
      cancel: async (input) => {
        stored.status = "CANCELLED";
        stored.cancellation = { at: "2026-11-04T03:00:00Z", byName: "Owner", reason: input.reason };
      },
      deleteProject: async () => {
        this.projects.splice(this.projects.indexOf(stored), 1);
      },
      addItem: async (input) => {
        const definition = this.definitions.find((row) => row.id === input.definitionId);
        if (!definition) return "NOT_FOUND";
        if (!definition.isActive) return "DEFINITION_INACTIVE";
        if (stored.items.some((item) => item.definitionId === input.definitionId)) {
          return "DUPLICATE_DEFINITION";
        }
        stored.items.push(
          this.itemRecord(stored.id, stored.items.length, {
            definitionId: input.definitionId,
            value: input.value,
          }),
        );
        return "ADDED";
      },
      findItem: async (itemId) => stored.items.find((item) => item.id === itemId) ?? null,
      updateItemValue: async (itemId, value) => {
        stored.items = stored.items.map((item) => (item.id === itemId ? { ...item, value } : item));
      },
      removeItem: async (itemId) => {
        const before = stored.items.length;
        stored.items = stored.items.filter((item) => item.id !== itemId);
        return stored.items.length < before;
      },
      listFields: async () => stored.fields,
      updateFieldValues: async (values) => {
        stored.fields = stored.fields.map((field) =>
          field.key in values ? { ...field, value: values[field.key] ?? null } : field,
        );
      },
      addSession: async (input) => {
        stored.sessions.push({
          ...input,
          id: `${stored.id}-session-${String(stored.sessions.length + 10)}`,
          createdAt: "2026-10-02T00:00:00Z",
        });
      },
      updateSession: async (sessionId, input) => {
        const found = stored.sessions.find((session) => session.id === sessionId);
        if (!found) return false;
        stored.sessions = stored.sessions.map((session) =>
          session.id === sessionId ? { ...session, ...input } : session,
        );
        return true;
      },
      deleteSession: async (sessionId) => {
        const before = stored.sessions.length;
        stored.sessions = stored.sessions.filter((session) => session.id !== sessionId);
        return stored.sessions.length < before;
      },
    };
    return change(locked, writer);
  }

  async countSessions(context: WorkspaceContext, id: string): Promise<number | null> {
    const stored = this.projects.find(
      (row) => row.id === id && row.workspaceId === context.workspaceId,
    );
    return stored ? stored.sessions.length : null;
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
