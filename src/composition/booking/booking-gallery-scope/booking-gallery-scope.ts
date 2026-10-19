import "server-only";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createBetterAuthPasswordHasher } from "@/adapters/crypto/password-hasher/better-auth-password-hasher";
import { createWebCryptoRandomInt } from "@/adapters/crypto/random-int/web-crypto-random-int";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { ProjectError } from "@/features/booking/application/errors/project-errors/project-errors";
import { createProjectInputSchema } from "@/features/booking/application/schemas/create-project-input/create-project-input.schema";
import type {
  CreateProjectResult,
  ProjectWriteResult,
} from "@/features/booking/application/use-cases/project-results/project-results.types";
import type { GalleryPasswordCipherPort } from "@/features/gallery/application/ports/gallery-password-cipher/gallery-password-cipher.port";
import type { PasswordHasherPort } from "@/features/gallery/application/ports/password-hasher/password-hasher.port";
import type { RandomIntPort } from "@/features/gallery/application/ports/random-int/random-int.port";
import { prepareGalleryPassword } from "@/features/gallery/application/use-cases/create-gallery-for-booking/create-gallery-for-booking";
import type { PreparedGalleryPassword } from "@/features/gallery/application/use-cases/create-gallery-for-booking/create-gallery-for-booking.types";
import { generateGalleryPassword } from "@/features/gallery/domain/gallery-password/gallery-password";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { withRequestDb } from "../../request-db/request-db";
import { confirmBookingWithGallery, createProjectWithGallery } from "./booking-gallery-flows";
import { runBookingGalleryTransaction } from "./booking-gallery-transaction";

export { runBookingGalleryTransaction } from "./booking-gallery-transaction";

/** The ports that encrypt and hash a new gallery password before the booking transaction opens (ADR-017, D-4). */
export interface GalleryPlanDeps {
  readonly cipher: GalleryPasswordCipherPort;
  readonly hasher: PasswordHasherPort;
  readonly randomInt: RandomIntPort;
  readonly newId: () => string;
}

/** The production password ports, built from the Worker's gallery key (C-103). @param passwordKey - GALLERY_PASSWORD_KEY @returns the plan dependencies */
export function galleryPlanDeps(passwordKey: string): GalleryPlanDeps {
  return {
    cipher: createWebCryptoGalleryPasswordCipher(passwordKey),
    hasher: createBetterAuthPasswordHasher(),
    randomInt: createWebCryptoRandomInt(),
    newId: () => crypto.randomUUID(),
  };
}

/** Prepares a gallery password for a client's name, avoiding the name's words (BR-GAL-002, A-11). @param deps - password ports @param context - verified workspace @param clientName - the client's name @returns the prepared gallery */
async function planForClient(
  deps: GalleryPlanDeps,
  context: WorkspaceContext,
  clientName: string,
): Promise<PreparedGalleryPassword> {
  return prepareGalleryPassword(
    {
      cipher: deps.cipher,
      hasher: deps.hasher,
      passwords: { propose: () => generateGalleryPassword(deps.randomInt, clientName) },
      newId: deps.newId,
    },
    context,
  );
}

/**
 * Prepares the gallery for a create form: BOOKED forms get a plan from the client's name, DRAFT and invalid forms get none (AC-GFL-001, AC-GFL-004).
 * @param db - the request database, read only here
 * @param deps - password ports
 * @param context - verified workspace
 * @param values - the untrusted create form
 * @param locale - the formatting locale
 * @returns the plan, or null when the form saves no gallery
 * @throws ProjectError NOT_FOUND when the client is outside the workspace
 */
export async function planForCreate(
  db: Db,
  deps: GalleryPlanDeps,
  context: WorkspaceContext,
  values: unknown,
  locale: FormattingLocale,
): Promise<PreparedGalleryPassword | null> {
  const parsed = createProjectInputSchema(locale).safeParse(values);
  if (!parsed.success || parsed.data.mode !== "BOOKED") return null;
  const client = await createDrizzleProjectRepository(db).findFilterClient(
    context,
    parsed.data.clientId,
  );
  if (!client) throw new ProjectError("NOT_FOUND");
  return planForClient(deps, context, client.name);
}

/**
 * Prepares the gallery for confirming a draft, from the project's client (AC-GFL-002).
 * @param db - the request database, read only here
 * @param deps - password ports
 * @param context - verified workspace
 * @param projectId - the draft's id
 * @returns the plan
 * @throws ProjectError NOT_FOUND for a project outside the workspace
 */
export async function planForConfirm(
  db: Db,
  deps: GalleryPlanDeps,
  context: WorkspaceContext,
  projectId: string,
): Promise<PreparedGalleryPassword> {
  const facts = await createDrizzleGalleryRepository(db).findProjectFacts(context, projectId);
  if (!facts) throw new ProjectError("NOT_FOUND");
  return planForClient(deps, context, facts.clientName);
}

/** Saves a project; a BOOKED one gets its gallery in the same transaction (AC-GFL-001, AC-GFL-003). @param context - verified workspace @param actorId - the Owner @param values - the untrusted create form @param locale - formatting locale @returns the create result */
export function createBookedProject(
  context: WorkspaceContext,
  actorId: string,
  values: unknown,
  locale: FormattingLocale,
): Promise<CreateProjectResult> {
  return withRequestDb(async (db, rc) => {
    const deps = galleryPlanDeps(rc.env.GALLERY_PASSWORD_KEY);
    const plan = await planForCreate(db, deps, context, values, locale);
    return runBookingGalleryTransaction(db, (scope) =>
      createProjectWithGallery(scope, context, actorId, values, locale, plan),
    );
  });
}

/** Confirms a draft as BOOKED with its gallery in the same transaction (AC-GFL-002). @param context - verified workspace @param actorId - the Owner @param projectId - the project id @returns undefined, or the refusal */
export function confirmBookedProject(
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
): Promise<ProjectWriteResult> {
  return withRequestDb(async (db, rc) => {
    const deps = galleryPlanDeps(rc.env.GALLERY_PASSWORD_KEY);
    const plan = await planForConfirm(db, deps, context, projectId);
    return runBookingGalleryTransaction(db, (scope) =>
      confirmBookingWithGallery(scope, context, actorId, projectId, plan),
    );
  });
}
