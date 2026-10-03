import "server-only";

import { and, eq, sql } from "drizzle-orm";

import type {
  CategoryRecord,
  CategoryRepositoryPort,
} from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { service, serviceCategory } from "../schema/booking/catalog";
import { isReferencedRowError, pgCode } from "./pg-error";

const DUPLICATE_KEY = "23505";

// eslint-disable-next-line max-lines-per-function -- exposes the complete category repository port
export function createDrizzleCategoryRepository(db: DbExecutor): CategoryRepositoryPort {
  return {
    async list(context: WorkspaceContext): Promise<readonly CategoryRecord[]> {
      const rows = await db
        .select({
          id: serviceCategory.id,
          name: serviceCategory.name,
          isActive: serviceCategory.isActive,
          serviceCount: sql<number>`count(*) filter (where ${service.isActive})`,
          archivedServiceCount: sql<number>`count(*) filter (where not ${service.isActive})`,
        })
        .from(serviceCategory)
        .leftJoin(
          service,
          and(
            eq(service.workspaceId, context.workspaceId),
            eq(service.categoryId, serviceCategory.id),
          ),
        )
        .where(eq(serviceCategory.workspaceId, context.workspaceId))
        .groupBy(serviceCategory.id)
        .orderBy(serviceCategory.name);
      return rows.map((row) => ({
        ...row,
        serviceCount: row.serviceCount,
        archivedServiceCount: row.archivedServiceCount,
      }));
    },
    async create(context, name, editorUserId) {
      try {
        const rows = await db
          .insert(serviceCategory)
          .values({ workspaceId: context.workspaceId, name, updatedBy: editorUserId })
          .returning({ id: serviceCategory.id });
        const id = rows.at(0)?.id;
        if (!id) throw new Error("category insert returned no row");
        return { status: "CREATED", id };
      } catch (error) {
        if (pgCode(error) === DUPLICATE_KEY) return { status: "NAME_TAKEN" };
        throw error;
      }
    },
    async rename(context, change) {
      try {
        const rows = await db
          .update(serviceCategory)
          .set({ name: change.name, updatedBy: change.editorUserId, updatedAt: new Date() })
          .where(
            and(
              eq(serviceCategory.workspaceId, context.workspaceId),
              eq(serviceCategory.id, change.id),
            ),
          )
          .returning({ id: serviceCategory.id });
        return rows.length > 0 ? "UPDATED" : "NOT_FOUND";
      } catch (error) {
        if (pgCode(error) === DUPLICATE_KEY) return "NAME_TAKEN";
        throw error;
      }
    },
    async setActive(context, change) {
      const rows = await db
        .update(serviceCategory)
        .set({ isActive: change.isActive, updatedBy: change.editorUserId, updatedAt: new Date() })
        .where(
          and(
            eq(serviceCategory.workspaceId, context.workspaceId),
            eq(serviceCategory.id, change.id),
          ),
        )
        .returning({ id: serviceCategory.id });
      return rows.length > 0;
    },
    async delete(context, id) {
      try {
        const rows = await db
          .delete(serviceCategory)
          .where(
            and(eq(serviceCategory.workspaceId, context.workspaceId), eq(serviceCategory.id, id)),
          )
          .returning({ id: serviceCategory.id });
        return rows.length > 0 ? "DELETED" : "NOT_FOUND";
      } catch (error) {
        if (isReferencedRowError(error)) return "IN_USE";
        throw error;
      }
    },
  };
}
