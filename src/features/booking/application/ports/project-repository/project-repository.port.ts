import "server-only";

import type { SnapshotField } from "@/features/booking/domain/booking-field-value/booking-field-value.types";
import type { BookingValue } from "@/features/booking/domain/booking-field-value/booking-field-value.types";
import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import type {
  SessionInput,
  SessionRecordShape,
} from "@/features/booking/domain/session/session.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ServiceItemRecord } from "../service-repository/service-repository.port";

export interface ProjectItemRecord {
  readonly id: string;
  readonly definitionId: string;
  readonly name: string;
  readonly unit: string | null;
  readonly valueType: "NUMBER" | "RANGE";
  readonly selectionRequired: boolean;
  readonly selectionType: "EDIT" | "PRINT" | null;
  readonly value: PackageValue;
}

export interface ProjectFieldRecord extends SnapshotField {
  readonly id: string;
  readonly value: BookingValue;
}

export interface ProjectDetailRecord {
  readonly id: string;
  readonly title: string;
  readonly notes: string | null;
  readonly agreedPrice: string;
  readonly currency: "IDR";
  readonly status: ProjectStatus;
  readonly client: {
    readonly id: string;
    readonly name: string;
    readonly whatsappNumber: string | null;
  };
  readonly service: { readonly id: string; readonly name: string };
  readonly items: readonly ProjectItemRecord[];
  readonly fields: readonly ProjectFieldRecord[];
  readonly sessions: readonly SessionRecordShape[];
  readonly cancellation: {
    readonly at: string;
    readonly byName: string | null;
    readonly reason: string | null;
  } | null;
}

export interface ProjectSnapshotInput {
  readonly status: "DRAFT" | "BOOKED";
  readonly clientId: string;
  readonly serviceId: string;
  readonly title: string;
  readonly notes: string | null;
  readonly agreedPrice: string;
  readonly accessToken: string;
  readonly actorId: string;
  readonly items: readonly { readonly definitionId: string; readonly value: PackageValue }[];
  readonly fieldValues: Readonly<Record<string, BookingValue>>;
  readonly sessions: readonly SessionInput[];
}

export type CreateSnapshotResult =
  | { readonly status: "CREATED"; readonly id: string }
  | { readonly status: "CLIENT_INACTIVE" | "SERVICE_INACTIVE" | "NOT_FOUND" }
  | {
      readonly status: "DEFINITION_INACTIVE" | "DUPLICATE_DEFINITION";
      readonly definitionId: string;
    };

export interface ServiceSnapshotSource {
  readonly id: string;
  readonly name: string;
  readonly categoryName: string;
  readonly basePrice: string;
  readonly isActive: boolean;
  readonly items: readonly ServiceItemRecord[];
  readonly fields: readonly SnapshotField[];
}

export interface ServiceOptionGroup {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly services: readonly ServiceSnapshotSource[];
}

export interface DefinitionRules {
  readonly id: string;
  readonly valueType: "NUMBER" | "RANGE";
  readonly selectionRequired: boolean;
  readonly isActive: boolean;
}

export interface ClientOption {
  readonly id: string;
  readonly name: string;
  readonly whatsappNumber: string | null;
  readonly projectCount: number;
}

/** Every call is scoped by the verified workspace (C-101). */
export interface ProjectRepositoryPort {
  /** Locks the client, service and definitions FOR SHARE and writes the whole project in one transaction (D-4). */
  readonly createSnapshot: (
    context: WorkspaceContext,
    input: ProjectSnapshotInput,
  ) => Promise<CreateSnapshotResult>;
  readonly findServiceForSnapshot: (
    context: WorkspaceContext,
    serviceId: string,
  ) => Promise<ServiceSnapshotSource | null>;
  readonly findDefinitionRules: (
    context: WorkspaceContext,
    ids: readonly string[],
  ) => Promise<readonly DefinitionRules[]>;
  readonly searchActiveClients: (
    context: WorkspaceContext,
    text: string,
    limit: number,
  ) => Promise<readonly ClientOption[]>;
  /** Never returns the client access token (C-103). */
  readonly findDetail: (
    context: WorkspaceContext,
    id: string,
  ) => Promise<ProjectDetailRecord | null>;
  readonly listActiveServiceOptions: (
    context: WorkspaceContext,
  ) => Promise<readonly ServiceOptionGroup[]>;
}
