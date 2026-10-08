import "server-only";

import { and, asc, eq } from "drizzle-orm";

import type {
  AddOnRecord,
  AddOnRepositoryPort,
  AddOnStatusWrite,
} from "@/features/booking/application/ports/add-on-repository/add-on-repository.port";
import type { AddOnStatus } from "@/features/booking/domain/add-on/add-on.types";
import { canonicalIdrAmount } from "@/features/booking/domain/idr-amount/idr-amount";
import { PROJECT_STATUSES } from "@/features/booking/domain/project-status/project-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { projectAddOn } from "../schema/booking/add-on";
import { project } from "../schema/booking/project";

const ADD_ON_STATUSES: readonly AddOnStatus[] = ["DRAFT", "APPROVED", "CANCELLED"];

const addOnColumns = {
  id: projectAddOn.id,
  selectionGroupId: projectAddOn.selectionGroupId,
  description: projectAddOn.description,
  quantity: projectAddOn.quantity,
  unitPrice: projectAddOn.unitPrice,
  totalAmount: projectAddOn.totalAmount,
  status: projectAddOn.status,
  approvedAt: projectAddOn.approvedAt,
  createdAt: projectAddOn.createdAt,
};

interface AddOnRow extends Omit<AddOnRecord, "status"> {
  readonly status: string;
}

function toRecord(row: AddOnRow): AddOnRecord {
  const status = ADD_ON_STATUSES.find((candidate) => candidate === row.status);
  if (!status) throw new Error("Stored add-on status is invalid.");
  return {
    ...row,
    status,
    unitPrice: canonicalIdrAmount(row.unitPrice),
    totalAmount: canonicalIdrAmount(row.totalAmount),
  };
}

const scoped = (context: WorkspaceContext, addOnId: string) =>
  and(eq(projectAddOn.workspaceId, context.workspaceId), eq(projectAddOn.id, addOnId));

async function selectProjectStatus(db: DbExecutor, context: WorkspaceContext, projectId: string) {
  const rows = await db
    .select({ status: project.status })
    .from(project)
    .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, projectId)));
  return PROJECT_STATUSES.find((status) => status === rows.at(0)?.status) ?? null;
}

/** Approval or cancellation with who and when (BR-AUD-001). @param db - the executor @param context - verified workspace @param addOnId - the add-on @param change - status, actor and time */
async function updateStatus(
  db: DbExecutor,
  context: WorkspaceContext,
  addOnId: string,
  change: AddOnStatusWrite,
) {
  const audit =
    change.status === "APPROVED"
      ? { approvedAt: change.at, approvedBy: change.actorId }
      : { cancelledAt: change.at, cancelledBy: change.actorId };
  await db
    .update(projectAddOn)
    .set({ status: change.status, ...audit, updatedAt: change.at })
    .where(scoped(context, addOnId));
}

/** Project add-ons in Postgres, every query scoped by workspace (C-101, D-16). @param db - the executor or the scope's transaction @returns the repository */
export function createDrizzleAddOnRepository(db: DbExecutor): AddOnRepositoryPort {
  return {
    findProjectStatus: (context, projectId) => selectProjectStatus(db, context, projectId),
    async insert(context, addOn) {
      const id = crypto.randomUUID();
      await db.insert(projectAddOn).values({ ...addOn, id, workspaceId: context.workspaceId });
      return id;
    },
    async list(context, projectId) {
      const rows = await db
        .select(addOnColumns)
        .from(projectAddOn)
        .where(
          and(
            eq(projectAddOn.workspaceId, context.workspaceId),
            eq(projectAddOn.projectId, projectId),
          ),
        )
        .orderBy(asc(projectAddOn.createdAt), asc(projectAddOn.id));
      return rows.map(toRecord);
    },
    async findForUpdate(context, projectId, addOnId) {
      const rows = await db
        .select(addOnColumns)
        .from(projectAddOn)
        .where(and(scoped(context, addOnId), eq(projectAddOn.projectId, projectId)))
        .for("update");
      const row = rows.at(0);
      return row ? toRecord(row) : null;
    },
    setStatus: (context, addOnId, change) => updateStatus(db, context, addOnId, change),
    async deleteDraft(context, addOnId) {
      await db
        .delete(projectAddOn)
        .where(and(scoped(context, addOnId), eq(projectAddOn.status, "DRAFT")));
    },
  };
}
