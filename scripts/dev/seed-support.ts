// Shared types and guards for `pnpm db:seed` (scripts/dev/seed.ts and its seed-*.ts modules).
import { and, eq } from "drizzle-orm";

import type { AuthEnv } from "@/adapters/auth/create-auth/create-auth.types";
import type { Db } from "@/adapters/db/client/client.types";
import { serviceItemDefinition } from "@/adapters/db/schema/booking/catalog";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface SeedEnv {
  readonly databaseUrl: string;
  readonly auth: AuthEnv;
  readonly galleryPasswordKey: string;
  readonly driveApiKey: string;
  readonly ownerEmail: string;
  readonly ownerPassword: string;
  readonly galleryPassword: string;
  readonly driveFolder: string;
  /** A public folder with subfolders for the package items; unset skips the delivered and completed projects. */
  readonly finalDriveFolder: string | null;
  readonly credentialsFile: string;
}

export interface Studio {
  readonly db: Db;
  readonly context: WorkspaceContext;
  readonly ownerId: string;
}

type Ok<T> = Extract<T, { readonly ok: true }>;

function isOk<T extends { readonly ok: boolean }>(result: T): result is Ok<T> {
  return result.ok;
}

/** Throws unless a use case result is ok, naming the step. */
export function check<T extends { readonly ok: boolean }>(step: string, result: T): Ok<T> {
  if (!isOk(result)) throw new Error(`${step} failed: ${JSON.stringify(result)}`);
  return result;
}

/** Throws unless a use case that returns undefined on success succeeded, naming the step. */
export function done(step: string, result: unknown): void {
  if (result !== undefined) throw new Error(`${step} failed: ${JSON.stringify(result)}`);
}

/** Throws when a value the step should have returned is missing. */
export function present<T>(label: string, value: T | undefined): T {
  if (value === undefined) throw new Error(`${label} is missing`);
  return value;
}

/** An ISO date `days` from today; negative is in the past. */
export function sessionDate(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

/** The id of a workspace item definition by name (the four defaults are seeded with the workspace). */
export async function definitionId(studio: Studio, name: string): Promise<string> {
  const row = (
    await studio.db
      .select({ id: serviceItemDefinition.id })
      .from(serviceItemDefinition)
      .where(
        and(
          eq(serviceItemDefinition.workspaceId, studio.context.workspaceId),
          eq(serviceItemDefinition.name, name),
        ),
      )
  ).at(0);
  if (!row) throw new Error(`default item definition ${name} is missing`);
  return row.id;
}
