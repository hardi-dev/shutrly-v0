// Seeds one demo studio on a NON-production database through the app's own use cases: an Owner
// who signs in with email and password, a workspace with its defaults, a catalog, two clients, a
// booked project with a gallery synced from a real public Drive folder and published, and a draft
// project. Final delivery is published too when the folder has `edited` or `print` subfolders.
// It never deletes or overwrites: it stops when the Owner's email already exists.
// The generated passwords and the client link go to a git-ignored file, never to the repo.
// Usage: pnpm db:seed
//   target: DATABASE_URL and the keys from the environment, else from SEED_ENV_FILE (.dev.vars)
//   SEED_OWNER_EMAIL (default owner@shutrly.test), SEED_OWNER_PASSWORD, SEED_GALLERY_PASSWORD
//   SEED_DRIVE_FOLDER (a public folder link), SEED_CREDENTIALS_FILE (default .env.seed)
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";
import { and, eq, sql } from "drizzle-orm";

import { createWebCryptoAccessTokenGenerator } from "@/adapters/crypto/access-token-generator/web-crypto-access-token-generator";
import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createBetterAuthPasswordHasher } from "@/adapters/crypto/password-hasher/better-auth-password-hasher";
import { createWebCryptoRandomInt } from "@/adapters/crypto/random-int/web-crypto-random-int";
import { createDrizzleCategoryRepository } from "@/adapters/db/catalog-repository/drizzle-category-repository";
import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import { createDrizzleServiceRepository } from "@/adapters/db/catalog-repository/drizzle-service-repository";
import { createDb } from "@/adapters/db/client/client";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientRepository } from "@/adapters/db/client-repository/drizzle-client-repository";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { account, user } from "@/adapters/db/schema/auth/auth";
import { serviceItemDefinition } from "@/adapters/db/schema/booking/catalog";
import { project } from "@/adapters/db/schema/booking/project";
import { gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { workspaceSourceConfig } from "@/adapters/db/schema/gallery/workspace-source-config";
import { createDrizzleTeamRoleRepository } from "@/adapters/db/team-repository/drizzle-team-role-repository";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";
import { createDrizzleWorkspaceSourceRepository } from "@/adapters/db/workspace-source-repository/drizzle-workspace-source-repository";
import { createGoogleDriveProvider } from "@/adapters/source/google-drive-provider/google-drive-provider";
import { runFinalDeliveryTransaction } from "@/composition/gallery/final-delivery-scope/final-delivery-scope";
import type { GalleryScope } from "@/composition/gallery/gallery-scope/gallery-scope.types";
import { addCategory } from "@/features/booking/application/use-cases/add-category/add-category";
import { addClient } from "@/features/booking/application/use-cases/add-client/add-client";
import { addService } from "@/features/booking/application/use-cases/add-service/add-service";
import { addServiceItem } from "@/features/booking/application/use-cases/add-service-item/add-service-item";
import { createProject } from "@/features/booking/application/use-cases/create-project/create-project";
import { seedDefaultItemDefinitions } from "@/features/booking/application/use-cases/seed-default-item-definitions/seed-default-item-definitions";
import { seedDefaultTeamRoles } from "@/features/booking/application/use-cases/seed-default-team-roles/seed-default-team-roles";
import { seedDefaultTemplates } from "@/features/communications/application/use-cases/seed-default-templates/seed-default-templates";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { publishGallery } from "@/features/gallery/application/use-cases/publish-gallery/publish-gallery";
import { seedDefaultSource } from "@/features/gallery/application/use-cases/seed-default-source/seed-default-source";
import { syncGallerySourceStep } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step";
import { createWorkspace } from "@/features/workspace/application/use-cases/create-workspace/create-workspace";
import { asOwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

const DEFAULT_FOLDER = "https://drive.google.com/drive/folders/1yyis5MpfzQHuJs1DZAE_StzDXC8HEvhC";
const MAX_SYNC_STEPS = 200;

interface SeedEnv {
  readonly databaseUrl: string;
  readonly galleryPasswordKey: string;
  readonly driveApiKey: string;
  readonly ownerEmail: string;
  readonly ownerPassword: string;
  readonly galleryPassword: string;
  readonly driveFolder: string;
  readonly credentialsFile: string;
}

interface Studio {
  readonly db: Db;
  readonly context: WorkspaceContext;
  readonly ownerId: string;
}

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
    galleryPasswordKey: required("GALLERY_PASSWORD_KEY"),
    driveApiKey: required("GOOGLE_DRIVE_API_KEY"),
    ownerEmail: process.env.SEED_OWNER_EMAIL ?? "owner@shutrly.test",
    ownerPassword: process.env.SEED_OWNER_PASSWORD ?? secret(16),
    galleryPassword: process.env.SEED_GALLERY_PASSWORD ?? secret(10),
    driveFolder: process.env.SEED_DRIVE_FOLDER ?? DEFAULT_FOLDER,
    credentialsFile: process.env.SEED_CREDENTIALS_FILE ?? ".env.seed",
  };
}

type Ok<T> = Extract<T, { readonly ok: true }>;

function isOk<T extends { readonly ok: boolean }>(result: T): result is Ok<T> {
  return result.ok;
}

/** Throws unless a use case result is ok, naming the step. */
function check<T extends { readonly ok: boolean }>(step: string, result: T): Ok<T> {
  if (!isOk(result)) throw new Error(`${step} failed: ${JSON.stringify(result)}`);
  return result;
}

/** Throws when a value the step should have returned is missing. */
function present<T>(label: string, value: T | undefined): T {
  if (value === undefined) throw new Error(`${label} is missing`);
  return value;
}

async function createOwner(db: Db, email: string, password: string): Promise<string> {
  const existing = (
    await db
      .select({ id: user.id })
      .from(user)
      .where(sql`lower(${user.email}) = lower(${email})`)
  ).at(0);
  if (existing) throw new Error(`${email} already exists; nothing was changed.`);
  const id = crypto.randomUUID();
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .insert(user)
      .values({ id, name: "Owner Contoh", email, emailVerified: true, emailVerifiedAt: now });
    await tx.insert(account).values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: await hashPassword(password),
    });
  });
  return id;
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

async function definitionId(studio: Studio, name: string): Promise<string> {
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

async function seedCatalog(studio: Studio): Promise<string> {
  const { db, context, ownerId } = studio;
  const services = createDrizzleServiceRepository(db);
  const definitions = createDrizzleItemDefinitionRepository(db);
  const category = check(
    "category",
    await addCategory(createDrizzleCategoryRepository(db), context, ownerId, { name: "Wisuda" }),
  );
  const service = check(
    "service",
    await addService(services, context, ownerId, {
      name: "Wisuda Basic",
      categoryId: present("category id", category.categoryId),
      basePrice: "1500000",
    }),
  );
  const serviceId = present("service id", service.serviceId);
  for (const [name, value] of [
    ["Foto edit", "10"],
    ["Foto cetak", "5"],
  ] as const) {
    const id = await definitionId(studio, name);
    check(
      `service item ${name}`,
      await addServiceItem(services, definitions, context, serviceId, id, ownerId, {
        type: "NUMBER",
        value,
      }),
    );
  }
  return serviceId;
}

async function seedClient(studio: Studio, name: string, whatsappNumber: string): Promise<string> {
  const result = check(
    `client ${name}`,
    await addClient(createDrizzleClientRepository(studio.db), studio.context, studio.ownerId, {
      name,
      whatsappNumber,
      socialLinks: [],
    }),
  );
  return present("client id", result.client).id;
}

function sessionDate(daysAhead: number): string {
  return new Date(Date.now() + daysAhead * 86_400_000).toISOString().slice(0, 10);
}

interface ProjectSeed {
  readonly mode: "BOOKED" | "DRAFT";
  readonly clientId: string;
  readonly serviceId: string;
  readonly title: string;
}

async function seedProject(studio: Studio, seed: ProjectSeed): Promise<string> {
  const items = [
    {
      definitionId: await definitionId(studio, "Foto edit"),
      value: { type: "NUMBER", value: "10" },
    },
    {
      definitionId: await definitionId(studio, "Foto cetak"),
      value: { type: "NUMBER", value: "5" },
    },
  ];
  const sessions =
    seed.mode === "BOOKED"
      ? [
          {
            name: "Wisuda",
            date: sessionDate(7),
            startTime: "08:00",
            endTime: "11:00",
            location: "Balairung",
            team: [],
          },
        ]
      : [];
  const result = check(
    `project ${seed.title}`,
    await createProject(
      createDrizzleProjectRepository(studio.db),
      createWebCryptoAccessTokenGenerator(),
      studio.context,
      studio.ownerId,
      { ...seed, agreedPrice: "1500000", notes: null, items, sessions, fieldValues: {} },
    ),
  );
  return result.projectId;
}

function galleryScope(studio: Studio, env: SeedEnv): GalleryScope {
  const { db } = studio;
  return {
    galleries: createDrizzleGalleryRepository(db),
    browse: createDrizzleGalleryBrowseReader(db),
    sources: createDrizzleGallerySourceRepository(db),
    workspaceSources: createDrizzleWorkspaceSourceRepository(db),
    provider: createGoogleDriveProvider(env.driveApiKey),
    directImages: true,
    rateLimiter: createNeonRateLimiter(db),
    cipher: createWebCryptoGalleryPasswordCipher(env.galleryPasswordKey),
    hasher: createBetterAuthPasswordHasher(),
    randomInt: createWebCryptoRandomInt(),
    newId: () => crypto.randomUUID(),
    now: new Date(),
  };
}

async function syncSource(studio: Studio, scope: GalleryScope, sourceId: string): Promise<void> {
  for (let step = 1; step <= MAX_SYNC_STEPS; step += 1) {
    const outcome = await syncGallerySourceStep(
      { ...scope, now: new Date() },
      studio.context,
      sourceId,
    );
    if (!outcome.ok) throw new Error(`sync refused: ${JSON.stringify(outcome)}`);
    if (outcome.status === "SUCCEEDED") return;
    if (outcome.status === "FAILED") throw new Error(`sync failed: ${outcome.errorCode}`);
    console.log(
      `  sync step ${String(step)}: ${String(outcome.foldersDone)}/${String(outcome.foldersTotal)} folders`,
    );
  }
  throw new Error("sync did not finish");
}

async function workspaceSourceId(studio: Studio): Promise<string> {
  const row = (
    await studio.db
      .select({ id: workspaceSourceConfig.id })
      .from(workspaceSourceConfig)
      .where(eq(workspaceSourceConfig.workspaceId, studio.context.workspaceId))
  ).at(0);
  if (!row) throw new Error("default photo source is missing");
  return row.id;
}

async function seedGallery(studio: Studio, env: SeedEnv, projectId: string): Promise<string> {
  const scope = galleryScope(studio, env);
  const { context, ownerId } = studio;
  const created = check(
    "gallery",
    await createGallery(scope, context, ownerId, projectId, {
      password: env.galleryPassword,
      expiry: { type: "NONE" },
    }),
  );
  const linked = check(
    "link folder",
    await linkGallerySource(scope, context, ownerId, created.galleryId, {
      workspaceSourceId: await workspaceSourceId(studio),
      link: env.driveFolder,
      label: "Foto wisuda",
    }),
  );
  await syncSource(studio, scope, linked.sourceId);
  check(
    "publish",
    await publishGallery({ ...scope, now: new Date() }, context, ownerId, created.galleryId),
  );
  return linked.sourceId;
}

async function publishDeliveryIfFinished(studio: Studio, projectId: string, sourceId: string) {
  const counts = present(
    "source counts",
    (
      await studio.db
        .select({
          edited: gallerySource.editedCount,
          print: gallerySource.printCount,
          proofs: gallerySource.proofCount,
        })
        .from(gallerySource)
        .where(eq(gallerySource.id, sourceId))
    ).at(0),
  );
  console.log(
    `  synced: ${String(counts.proofs)} proofs, ${String(counts.edited)} edited, ${String(counts.print)} print`,
  );
  if (counts.edited + counts.print === 0) {
    console.log("  final delivery skipped: add `edited` or `print` subfolders to the Drive folder");
    return false;
  }
  const refused = await runFinalDeliveryTransaction(studio.db, {
    context: studio.context,
    actorId: studio.ownerId,
    projectId,
  });
  if (refused) throw new Error(`final delivery refused: ${refused.reasons.join(", ")}`);
  return true;
}

async function clientToken(db: Db, projectId: string): Promise<string> {
  const row = (
    await db
      .select({ token: project.clientAccessToken })
      .from(project)
      .where(eq(project.id, projectId))
  ).at(0);
  if (!row?.token) throw new Error("client access token missing");
  return row.token;
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

async function seed(db: Db, env: SeedEnv) {
  const ownerId = await createOwner(db, env.ownerEmail, env.ownerPassword);
  const studio: Studio = { db, ownerId, context: await createStudio(db, ownerId) };
  console.log(`Owner ${env.ownerEmail} and workspace ${studio.context.workspaceId}`);
  const serviceId = await seedCatalog(studio);
  const rina = await seedClient(studio, "Rina Saputri", "0812-3456-7890");
  const sari = await seedClient(studio, "Sari Wulandari", "0813-2222-3333");
  const projectId = await seedProject(studio, {
    mode: "BOOKED",
    clientId: rina,
    serviceId,
    title: "Wisuda Rina",
  });
  await seedProject(studio, { mode: "DRAFT", clientId: sari, serviceId, title: "Wisuda Sari" });
  console.log("Gallery: linking and syncing the Drive folder");
  const sourceId = await seedGallery(studio, env, projectId);
  const delivered = await publishDeliveryIfFinished(studio, projectId, sourceId);
  writeCredentials(env, {
    SEED_OWNER_EMAIL: env.ownerEmail,
    SEED_OWNER_PASSWORD: env.ownerPassword,
    SEED_GALLERY_PASSWORD: env.galleryPassword,
    SEED_PROJECT_PATH: `/w/${studio.context.workspaceId}/projects/${projectId}`,
    SEED_CLIENT_PATH: `/g/${await clientToken(db, projectId)}`,
    SEED_FINAL_DELIVERY: delivered ? "published" : "not published",
  });
  console.log(`Done. Passwords and the client link are in ${env.credentialsFile} (git-ignored).`);
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
