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

import type { SessionWithTeam } from "../session-dialog/session-dialog.types";
import type { DraftItem, PackageDraftAction } from "./package-draft.types";

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
  /** The editable package: the service's items until the Owner changes them (AC-PRJ-030). */
  readonly items: readonly DraftItem[];
  readonly dispatchPackage: (action: PackageDraftAction) => void;
  /** The service the Owner picked while the package was edited; a confirm decides (spec › Main Flow 3). */
  readonly pendingService: ServiceOptionGroup["services"][number] | null;
  readonly confirmServiceChange: () => void;
  readonly cancelServiceChange: () => void;
}

export interface CreateProjectState {
  readonly form: CreateForm;
  readonly client: ProjectPicks["client"];
  readonly service: ProjectPicks["service"];
  readonly pendingMode: CreateProjectMode | null;
  readonly selectClient: ProjectPicks["selectClient"];
  readonly selectService: ProjectPicks["selectService"];
  readonly changeTitle: ProjectPicks["changeTitle"];
  readonly items: ProjectPicks["items"];
  readonly dispatchPackage: ProjectPicks["dispatchPackage"];
  readonly pendingService: ProjectPicks["pendingService"];
  readonly confirmServiceChange: ProjectPicks["confirmServiceChange"];
  readonly cancelServiceChange: ProjectPicks["cancelServiceChange"];
  readonly submit: (mode: CreateProjectMode) => Promise<void>;
  readonly addSession: (session: SessionWithTeam) => void;
  readonly updateSession: (index: number, session: SessionWithTeam) => void;
  readonly removeSession: (index: number) => void;
  readonly changeFieldValue: (key: string, value: BookingValue) => void;
}
