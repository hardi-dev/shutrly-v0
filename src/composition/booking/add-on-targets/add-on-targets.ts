import "server-only";

import type { AddOnTargetPort } from "@/features/booking/application/ports/add-on-target/add-on-target.port";
import type { SelectionRepositoryPort } from "@/features/gallery/application/ports/selection-repository/selection-repository.port";
import { checkAddOnTarget } from "@/features/gallery/application/use-cases/check-add-on-target/check-add-on-target";
import { addOnTargetCheck } from "@/features/gallery/domain/extra-limit/extra-limit";
import { effectiveLimit } from "@/features/gallery/domain/selection-usage/selection-usage";

/**
 * Lets booking ask the selection side about add-on targets without importing it (D-1, D-16).
 * @param selections - the selection repository, bound to the caller's executor
 * @returns the target port
 */
export function addOnTargetsOf(selections: SelectionRepositoryPort): AddOnTargetPort {
  return {
    check: (context, projectId, groupId) =>
      checkAddOnTarget({ selections }, context, projectId, groupId),
    async listGroups(context, projectId) {
      const groups = await selections.listGroups(context, projectId);
      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        unit: group.unit,
        status: group.status,
        limit: effectiveLimit(group.baseLimit, group.extraLimit),
        usage: group.usage,
        isTargetable: addOnTargetCheck(group.status) === "OK",
      }));
    },
  };
}
