export interface TeamMutationOutcome {
  readonly ok: boolean;
}

export interface TeamMutationSuccess {
  readonly title: string;
  readonly body?: string;
}
