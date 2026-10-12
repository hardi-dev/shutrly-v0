export type SetupStepKey = "service" | "packageItems" | "firstProject" | "brandName";

export type SetupStepState = "current" | "open" | "done" | "locked";

export type SetupStepTarget =
  | { readonly kind: "addService" }
  | { readonly kind: "service"; readonly serviceId: string }
  | { readonly kind: "services" }
  | { readonly kind: "newProject" }
  | { readonly kind: "settings" };

export interface SetupFacts {
  readonly hasProject: boolean;
  /** 0, 1, or 2 meaning "two or more" (the reader caps the count). */
  readonly activeServiceCount: number;
  /** The only active service's ID when exactly one exists, otherwise null. */
  readonly soleActiveServiceId: string | null;
  /** An active service has an item whose definition has selectionRequired (BR-SEL-001). */
  readonly hasSelectionItem: boolean;
  readonly hasBrandName: boolean;
}

export interface SetupStep {
  readonly key: SetupStepKey;
  readonly state: SetupStepState;
  readonly target: SetupStepTarget;
}

export interface SetupChecklist {
  readonly steps: readonly SetupStep[];
  readonly doneCount: number;
  readonly total: number;
}
