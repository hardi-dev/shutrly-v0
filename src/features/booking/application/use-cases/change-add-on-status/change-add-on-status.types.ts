import type { AddOnRepositoryPort } from "../../ports/add-on-repository/add-on-repository.port";

export interface AddOnStatusDeps {
  readonly addOns: AddOnRepositoryPort;
  readonly now: Date;
}

export interface AddOnStatusRequest {
  readonly actorId: string;
  readonly projectId: string;
  readonly action: "APPROVE" | "CANCEL";
  /** Untrusted `{ addOnId }`. */
  readonly input: unknown;
}
