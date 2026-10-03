import type { UseFormReturn } from "react-hook-form";

import type {
  ClientOption,
  ServiceOptionGroup,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type {
  CreateProjectFormValues,
  CreateProjectInput,
} from "@/features/booking/application/schemas/create-project-input/create-project-input.types";
import type { CreateProjectResult } from "@/features/booking/application/use-cases/project-results/project-results.types";
import type { BookingValue } from "@/features/booking/domain/booking-field-value/booking-field-value.types";
import type { SessionInput } from "@/features/booking/domain/session/session.types";

export type CreateProjectCall = (
  workspaceId: string,
  values: unknown,
) => Promise<CreateProjectResult>;

export interface UseCreateProjectFormInput {
  readonly workspaceId: string;
  readonly serviceGroups: readonly ServiceOptionGroup[];
  readonly createAction: CreateProjectCall;
}

export type CreateProjectMode = "DRAFT" | "BOOKED";

export type CreateForm = UseFormReturn<CreateProjectFormValues, unknown, CreateProjectInput>;

export interface ProjectPicks {
  readonly client: ClientOption | null;
  readonly service: ServiceOptionGroup["services"][number] | null;
  readonly selectClient: (option: ClientOption) => void;
  readonly selectService: (id: string) => void;
  readonly changeTitle: (title: string) => void;
}

export interface CreateProjectState {
  readonly form: CreateForm;
  readonly client: ProjectPicks["client"];
  readonly service: ProjectPicks["service"];
  readonly pendingMode: CreateProjectMode | null;
  readonly selectClient: ProjectPicks["selectClient"];
  readonly selectService: ProjectPicks["selectService"];
  readonly changeTitle: ProjectPicks["changeTitle"];
  readonly submit: (mode: CreateProjectMode) => Promise<void>;
  readonly addSession: (session: SessionInput) => void;
  readonly updateSession: (index: number, session: SessionInput) => void;
  readonly removeSession: (index: number) => void;
  readonly changeFieldValue: (key: string, value: BookingValue) => void;
}
