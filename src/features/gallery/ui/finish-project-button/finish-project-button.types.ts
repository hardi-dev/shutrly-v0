/** The server action that completes a DELIVERED project; a truthy result is a stale-status refusal (BR-PRJ-004). */
export interface FinishProjectActions {
  readonly completeAction: (workspaceId: string, projectId: string) => Promise<unknown>;
}

export interface FinishProjectButtonProps {
  readonly workspaceId: string;
  readonly projectId: string;
  /** The project title for the confirm's description. */
  readonly title: string;
  readonly actions: FinishProjectActions;
}
