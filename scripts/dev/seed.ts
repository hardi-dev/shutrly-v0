// Seeds one demo studio on a NON-production database through the app's own use cases: an Owner
// registered and verified through Better Auth (signUpEmail, then the verification link), a workspace
// with its defaults, a catalog of three categories (seed-catalog.ts), ten clients, a team of four,
// and a project in every status with sessions, teams, booking values, galleries synced from a real
// public Drive folder, client picks and add-ons (seed-projects.ts). DELIVERED and COMPLETED need
// SEED_FINAL_DRIVE_FOLDER: a folder whose `edited` / `print` subfolders are mapped to the package
// items (F-21) before final delivery is published.
// It never deletes or overwrites: it stops when the Owner's email already exists.
// The generated passwords and the client links go to a git-ignored file, never to the repo.
// Usage: pnpm db:seed
//   target: DATABASE_URL and the keys from the environment, else from SEED_ENV_FILE (.dev.vars)
//   SEED_OWNER_EMAIL (default owner@shutrly.test), SEED_OWNER_PASSWORD, SEED_GALLERY_PASSWORD
//   SEED_DRIVE_FOLDER, SEED_FINAL_DRIVE_FOLDER (public folder links), SEED_CREDENTIALS_FILE (.env.seed)
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

import { config } from "dotenv";

import { createBetterAuthIdentity } from "@/adapters/auth/identity/better-auth-identity";
import { createDrizzleAccountDirectory } from "@/adapters/db/account-directory/drizzle-account-directory";
import { createBetterAuthDatabase } from "@/adapters/db/better-auth-database/better-auth-database";
import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import { createDb } from "@/adapters/db/client/client";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleLinkRegistry } from "@/adapters/db/link-registry/drizzle-link-registry";
import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { createDrizzleTeamRoleRepository } from "@/adapters/db/team-repository/drizzle-team-role-repository";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";
import { createDrizzleWorkspaceSourceRepository } from "@/adapters/db/workspace-source-repository/drizzle-workspace-source-repository";
import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";
import { seedDefaultItemDefinitions } from "@/features/booking/application/use-cases/seed-default-item-definitions/seed-default-item-definitions";
import { seedDefaultTeamRoles } from "@/features/booking/application/use-cases/seed-default-team-roles/seed-default-team-roles";
import { seedDefaultTemplates } from "@/features/communications/application/use-cases/seed-default-templates/seed-default-templates";
import { seedDefaultSource } from "@/features/gallery/application/use-cases/seed-default-source/seed-default-source";
import { createWorkspace } from "@/features/workspace/application/use-cases/create-workspace/create-workspace";
import { asOwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { seedCatalog, seedClients, seedTeam } from "./seed-catalog";
import { clientToken } from "./seed-gallery";
import { seedProjects } from "./seed-projects";
import { present, type SeedEnv, type Studio } from "./seed-support";

const DEFAULT_FOLDER = "https://drive.google.com/drive/folders/1yyis5MpfzQHuJs1DZAE_StzDXC8HEvhC";

// Projects whose client link goes to the credentials file: they have a published gallery.
const CLIENT_LINKS = ["Wisuda Rina", "Wisuda Fajar", "Prewedding Kevin & Maya", "Wisuda Lina"];

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing (environment or .dev.vars).`);
  return value;
}

function secret(length: number): string {
  return randomBytes(length).toString("base64url").slice(0, length);
}

function readEnv(): SeedEnv {
  config({ path: process.env.SEED_ENV_FILE ?? ".dev.vars", quiet: true });
  if (process.env.APP_STAGE === "production") throw new Error("Refusing to seed production.");
  return {
    databaseUrl: required("DATABASE_URL"),
    auth: {
      BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET"),
      BETTER_AUTH_URL: required("BETTER_AUTH_URL"),
      GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
      GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
    },
    galleryPasswordKey: required("GALLERY_PASSWORD_KEY"),
    driveApiKey: required("GOOGLE_DRIVE_API_KEY"),
    ownerEmail: process.env.SEED_OWNER_EMAIL ?? "owner@shutrly.test",
    ownerPassword: process.env.SEED_OWNER_PASSWORD ?? secret(16),
    galleryPassword: process.env.SEED_GALLERY_PASSWORD ?? secret(10),
    driveFolder: process.env.SEED_DRIVE_FOLDER ?? DEFAULT_FOLDER,
    finalDriveFolder: process.env.SEED_FINAL_DRIVE_FOLDER ?? null,
    credentialsFile: process.env.SEED_CREDENTIALS_FILE ?? ".env.seed",
  };
}

function ownerIdentity(db: Db, env: SeedEnv, onLink: (link: AuthLink) => void) {
  return createBetterAuthIdentity({
    database: createBetterAuthDatabase(db),
    env: env.auth,
    accounts: createDrizzleAccountDirectory(db),
    links: createDrizzleLinkRegistry(db),
    onLink,
  }).identity;
}

/** Registers the Owner through Better Auth (`signUpEmail`), then verifies the email with the link it issues, as a new Owner would. */
async function createOwner(db: Db, env: SeedEnv): Promise<string> {
  const links: AuthLink[] = [];
  const identity = ownerIdentity(db, env, (link) => links.push(link));
  const email = normaliseEmail(env.ownerEmail);
  const password = env.ownerPassword;
  const created = await identity.createPasswordUser({ name: "Owner Contoh", email, password });
  if (!created.created) throw new Error(`${email} already exists; nothing was changed.`);
  await identity.sendVerificationLink(email);
  const link = present("verification link", links.at(-1));
  const token = present(
    "verification token",
    new URL(link.url).searchParams.get("token") ?? undefined,
  );
  const verified = await identity.verifyEmail(token);
  if (!verified.ok) throw new Error("email verification failed");
  return verified.userId;
}

async function createStudio(db: Db, ownerId: string): Promise<WorkspaceContext> {
  const workspaceId = await db.transaction(async (tx) => {
    const created = await createWorkspace(
      createDrizzleWorkspaceRepository(tx),
      asOwnerUserId(ownerId),
      { name: "Studio Contoh" },
    );
    const context = { workspaceId: created.id };
    await seedDefaultTemplates(createDrizzleMessageTemplateRepository(tx), context);
    await seedDefaultSource(createDrizzleWorkspaceSourceRepository(tx), context);
    await seedDefaultItemDefinitions(createDrizzleItemDefinitionRepository(tx), context);
    await seedDefaultTeamRoles(createDrizzleTeamRoleRepository(tx), context);
    return created.id;
  });
  return { workspaceId: asWorkspaceId(workspaceId) };
}

function writeCredentials(env: SeedEnv, lines: Readonly<Record<string, string>>): void {
  const body = Object.entries(lines)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  writeFileSync(
    env.credentialsFile,
    `# Written by pnpm db:seed on ${new Date().toISOString()}\n${body}\n`,
    {
      mode: 0o600,
    },
  );
}

const envKey = (title: string) => title.toUpperCase().replace(/[^A-Z0-9]+/g, "_");

async function seed(db: Db, env: SeedEnv) {
  const ownerId = await createOwner(db, env);
  const studio: Studio = { db, ownerId, context: await createStudio(db, ownerId) };
  console.log(`Owner ${env.ownerEmail} and workspace ${studio.context.workspaceId}`);
  const services = await seedCatalog(studio);
  const clients = await seedClients(studio);
  const team = await seedTeam(studio);
  const projects = await seedProjects(studio, { env, services, clients, team });
  const lines: Record<string, string> = {
    SEED_OWNER_EMAIL: env.ownerEmail,
    SEED_OWNER_PASSWORD: env.ownerPassword,
    SEED_GALLERY_PASSWORD: env.galleryPassword,
  };
  for (const [title, projectId] of Object.entries(projects)) {
    lines[`SEED_PROJECT_${envKey(title)}`] =
      `/w/${studio.context.workspaceId}/projects/${projectId}`;
    if (CLIENT_LINKS.includes(title)) {
      lines[`SEED_CLIENT_${envKey(title)}`] = `/g/${await clientToken(studio, projectId)}`;
    }
  }
  writeCredentials(env, lines);
  console.log(`Done. Passwords and the client links are in ${env.credentialsFile} (git-ignored).`);
}

async function main(): Promise<void> {
  const env = readEnv();
  const host = new URL(env.databaseUrl).hostname;
  console.log(`Seeding ${host}`);
  const { db, pool } = createDb(env.databaseUrl);
  try {
    await seed(db, env);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
