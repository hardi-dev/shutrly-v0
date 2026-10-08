import "server-only";

import { extraLimitChange } from "@/features/gallery/domain/extra-limit/extra-limit";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  AdjustExtraLimitDeps,
  AdjustExtraLimitResult,
  ExtraLimitDelta,
} from "./adjust-extra-limit.types";

/**
 * Applies an add-on's approval or cancellation to its target group under the group lock, inside
 * the add-on scope's transaction (D-16, ADR-016): refuses a locked target, reopens a submitted
 * group, and refuses a cancel below usage (BR-SEL-002, BR-ADD-004, BR-ADD-005, A-22).
 * @param deps - the selection repository bound to the transaction
 * @param context - verified workspace
 * @param projectId - the add-on's project; a group of another project is refused
 * @param change - the group and the signed quantity
 * @returns ok, or why the group refused
 */
export async function adjustExtraLimit(
  deps: AdjustExtraLimitDeps,
  context: WorkspaceContext,
  projectId: string,
  change: ExtraLimitDelta,
): Promise<AdjustExtraLimitResult> {
  const result = await deps.selections.withLockedGroup<AdjustExtraLimitResult>(
    context,
    projectId,
    change.groupId,
    async (group, writer) => {
      const next = extraLimitChange(group, change.delta);
      if (!next.ok) return next;
      await writer.setExtraLimit(next.extraLimit, next.reopen);
      return { ok: true };
    },
  );
  return result === "NOT_FOUND" ? { ok: false, code: "TARGET_OTHER_PROJECT" } : result;
}
