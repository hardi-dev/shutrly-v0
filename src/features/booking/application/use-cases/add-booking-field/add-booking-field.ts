import "server-only";

import { normaliseCatalogName } from "@/features/booking/domain/catalog-name/catalog-name";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";
import { bookingFieldSchema } from "../../schemas/booking-field/booking-field.schema";
import { validationFailure } from "../catalog-results/catalog-results";
import type { BookingFieldWriteResult } from "../service-results/service-results.types";

export async function addBookingField(
  repository: ServiceRepositoryPort,
  context: WorkspaceContext,
  serviceId: string,
  editorUserId: string,
  input: unknown,
): Promise<BookingFieldWriteResult> {
  const parsed = bookingFieldSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues[0]);
  const result = await repository.addField(context, serviceId, {
    ...parsed.data,
    name: normaliseCatalogName(parsed.data.name),
    editorUserId,
  });
  if (result === "NOT_FOUND") throw new CatalogError("NOT_FOUND");
  if (result === "NAME_TAKEN")
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "NAME_TAKEN" } };
  return { ok: true };
}
