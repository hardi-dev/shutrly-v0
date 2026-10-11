"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import type { TeamTranslate } from "../team-copy/team-copy.types";
import { USE_TEAM_MUTATIONS_COPY_NAMESPACE } from "./use-team-mutations.copy";
import type { TeamMutationOutcome, TeamMutationSuccess } from "./use-team-mutations.types";

async function runTeamMutation<R extends TeamMutationOutcome | undefined>(
  t: TeamTranslate,
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
      title: t("serverErrorTitle"),
      action: {
        label: t("retry"),
        onAction: () => void runTeamMutation(t, call, success).catch(() => undefined),
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
  const t = useTranslations(USE_TEAM_MUTATIONS_COPY_NAMESPACE);
  const run = useCallback(
    <R extends TeamMutationOutcome | undefined>(
      call: () => Promise<R>,
      success: TeamMutationSuccess,
    ) => runTeamMutation(t, call, success),
    [t],
  );
  return { run };
}
