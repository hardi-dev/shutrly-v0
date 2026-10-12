import "server-only";

import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";
import { validateItemList } from "@/features/booking/domain/project-items/project-items";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import { packageValueInputSchema } from "../../schemas/package-value-input/package-value-input.schema";
import {
  addItemInputSchema,
  itemValueInputSchema,
} from "../../schemas/project-edit-input/project-edit-input.schema";
import { toValidationFailure, validationFailureOf } from "../project-results/project-results";
import type {
  ProjectFieldErrorKey,
  ProjectWriteResult,
} from "../project-results/project-results.types";
import { editProject } from "./edit-project";

const ITEM_PREFIX = "items.0.";

function checkValue(
  definitionId: string,
  rules: { valueType: "NUMBER" | "RANGE"; selectionRequired: boolean },
  value: unknown,
  locale: FormattingLocale,
): { value: PackageValue } | { failure: ProjectWriteResult } {
  const parsed = packageValueInputSchema.safeParse(value);
  if (!parsed.success) return { failure: toValidationFailure(parsed.error.issues) };
  const checked = validateItemList(
    [{ definitionId, value: parsed.data }],
    {
      [definitionId]: rules,
    },
    locale,
  );
  const errors: Record<string, ProjectFieldErrorKey> = {};
  for (const [path, problem] of Object.entries(checked.errors)) {
    errors[path.startsWith(ITEM_PREFIX) ? path.slice(ITEM_PREFIX.length) : path] = problem;
  }
  const first = checked.values.at(0);
  if (Object.keys(errors).length > 0 || !first) return { failure: validationFailureOf(errors) };
  return { value: first };
}

/** Adds a package item from an active definition while the deal is editable (AC-PRJ-017). @param repository - project port @param context - verified workspace @param actorId - the owner @param projectId - the project @param input - untrusted `{ definitionId, value }` @returns undefined or a failure */
export async function addProjectItem(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  input: unknown,
  locale: FormattingLocale,
): Promise<ProjectWriteResult> {
  const parsed = addItemInputSchema.safeParse(input);
  if (!parsed.success) return toValidationFailure(parsed.error.issues);
  const { definitionId } = parsed.data;
  const rules = (await repository.findDefinitionRules(context, [definitionId])).at(0);
  if (!rules) throw new ProjectError("NOT_FOUND");
  const checked = checkValue(definitionId, rules, parsed.data.value, locale);
  if ("failure" in checked) return checked.failure;
  return editProject(repository, context, projectId, "deal", async (_locked, writer) => {
    const outcome = await writer.addItem({ definitionId, value: checked.value, actorId });
    if (outcome === "NOT_FOUND") throw new ProjectError("NOT_FOUND");
    if (outcome === "ADDED") return undefined;
    return validationFailureOf({ definitionId: outcome });
  });
}

/** Changes one item's value, validated against that item's own type (AC-PRJ-017). @param repository - project port @param context - verified workspace @param actorId - the owner @param projectId - the project @param itemId - the item @param input - untrusted `{ value }` @returns undefined or a failure */
export function updateProjectItemValue(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  itemId: string,
  input: unknown,
  locale: FormattingLocale,
): Promise<ProjectWriteResult> {
  const parsed = itemValueInputSchema.safeParse(input);
  if (!parsed.success) return Promise.resolve(toValidationFailure(parsed.error.issues));
  return editProject(repository, context, projectId, "deal", async (_locked, writer) => {
    const item = await writer.findItem(itemId);
    if (!item) throw new ProjectError("NOT_FOUND");
    const checked = checkValue(item.definitionId, item, parsed.data.value, locale);
    if ("failure" in checked) return checked.failure;
    await writer.updateItemValue(itemId, checked.value, actorId);
    return undefined;
  });
}

/** Removes a package item while the deal is editable (AC-PRJ-017). @param repository - project port @param context - verified workspace @param projectId - the project @param itemId - the item @returns undefined or a failure */
export function removeProjectItem(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  projectId: string,
  itemId: string,
): Promise<ProjectWriteResult> {
  return editProject(repository, context, projectId, "deal", async (_locked, writer) => {
    if (!(await writer.removeItem(itemId))) throw new ProjectError("NOT_FOUND");
    return undefined;
  });
}
