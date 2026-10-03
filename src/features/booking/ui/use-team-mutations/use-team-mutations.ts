"use client";

import { useCallback } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import type { TeamMutationOutcome, TeamMutationSuccess } from "./use-team-mutations.types";

async function runTeamMutation<R extends TeamMutationOutcome | undefined>(
  call: () => Promise<R>,
  success: TeamMutationSuccess,
): Promise<R> {
  try {
    const result = await call();
    if (result?.ok === false) return result;
    showToast({ tone: "success", title: success.title, body: success.body });
    return result;
  } catch (error) {
    showToast({
      tone: "danger",
      title: TEAM_COPY.serverErrorTitle,
      action: {
        label: TEAM_COPY.retry,
        onAction: () => void runTeamMutation(call, success).catch(() => undefined),
      },
    });
    throw error;
  }
}

/**
 * Runs a team write and shows its success toast, or a retryable failure toast (AC-TEAM-023).
 * A failed outcome (`ok: false`) is returned for the form to show; a throw is rethrown.
 * @returns `run(call, success)`
 */
export function useTeamMutations() {
  const run = useCallback(
    <R extends TeamMutationOutcome | undefined>(
      call: () => Promise<R>,
      success: TeamMutationSuccess,
    ) => runTeamMutation(call, success),
    [],
  );
  return { run };
}
