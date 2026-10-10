// Demo projects for `pnpm db:seed`: one per status, with sessions, teams, booking values, add-ons and
// client picks, all through the app's use cases (status steps, cancel, final delivery, completion).
import { createWebCryptoAccessTokenGenerator } from "@/adapters/crypto/access-token-generator/web-crypto-access-token-generator";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import {
  approveAddOnWithLimit,
  createAddOnWithTarget,
} from "@/composition/booking/add-on-edits/add-on-edits";
import { runAddOnTransaction } from "@/composition/booking/add-on-scope/add-on-scope";
import { advanceProject } from "@/features/booking/application/use-cases/advance-project/advance-project";
import { cancelProject } from "@/features/booking/application/use-cases/cancel-project/cancel-project";
import { completeProject } from "@/features/booking/application/use-cases/complete-project/complete-project";
import { createProject } from "@/features/booking/application/use-cases/create-project/create-project";
import { lockSelectionGroup } from "@/features/gallery/application/use-cases/lock-selection-group/lock-selection-group";
import type { ClientContext } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";
import { setPick } from "@/features/gallery/application/use-cases/set-pick/set-pick";
import { setPickNote } from "@/features/gallery/application/use-cases/set-pick-note/set-pick-note";
import { setPicks } from "@/features/gallery/application/use-cases/set-picks/set-picks";
import { submitSelectionGroup } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group";

import type { SeededService, Team, TeamPick } from "./seed-catalog";
import {
  clientOf,
  proofIds,
  publishDeliveryIfFinished,
  type SeededGallery,
  seedGallery,
} from "./seed-gallery";
import { check, definitionId, done, type SeedEnv, sessionDate, type Studio } from "./seed-support";

type Step = "CONFIRM_BOOKING" | "START_SHOOTING" | "FINISH_SHOOTING";

interface SessionSeed {
  readonly name: string;
  readonly days: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly location: string;
  readonly team: readonly TeamPick[];
}

interface ProjectSeed {
  readonly mode: "BOOKED" | "DRAFT";
  readonly client: string;
  readonly service: SeededService;
  readonly title: string;
  readonly sessions: readonly SessionSeed[];
  readonly fieldValues?: Readonly<Record<string, string | boolean>>;
  readonly notes?: string;
}

export interface SeedInputs {
  readonly env: SeedEnv;
  readonly services: Readonly<Record<string, SeededService>>;
  readonly clients: Readonly<Record<string, string>>;
  readonly team: Team;
}

/** What the credentials file lists: project paths and client links by title. */
export type SeededLinks = Record<string, string>;

async function createSeedProject(studio: Studio, seed: ProjectSeed): Promise<string> {
  const items = await Promise.all(
    seed.service.items.map(async ([name, value]) => ({
      definitionId: await definitionId(studio, name),
      value: { type: "NUMBER", value },
    })),
  );
  const sessions = seed.sessions.map(({ days, team, ...session }) => ({
    ...session,
    date: sessionDate(days),
    team: [...team],
  }));
  const result = check(
    `project ${seed.title}`,
    await createProject(
      createDrizzleProjectRepository(studio.db),
      createWebCryptoAccessTokenGenerator(),
      studio.context,
      studio.ownerId,
      {
        mode: seed.mode,
        clientId: seed.client,
        serviceId: seed.service.id,
        title: seed.title,
        agreedPrice: seed.service.price,
        notes: seed.notes ?? null,
        items,
        sessions,
        fieldValues: seed.fieldValues ?? {},
      },
    ),
  );
  return result.projectId;
}

async function advance(studio: Studio, projectId: string, steps: readonly Step[]): Promise<void> {
  const projects = createDrizzleProjectRepository(studio.db);
  for (const step of steps) {
    done(step, await advanceProject(projects, studio.context, studio.ownerId, projectId, step));
  }
}

const selectionDeps = (studio: Studio) => ({
  selections: createDrizzleSelectionRepository(studio.db),
  rateLimiter: createNeonRateLimiter(studio.db),
});

async function groupId(studio: Studio, projectId: string, name: string): Promise<string> {
  const groups = await selectionDeps(studio).selections.listGroups(studio.context, projectId);
  const group = groups.find((candidate) => candidate.name === name);
  if (!group) throw new Error(`selection group ${name} is missing`);
  return group.id;
}

/** *Wisuda Rina*: an approved add-on (+5 *Foto edit*) and a draft one; both groups stay open with some picks. */
async function seedOpenSelection(studio: Studio, projectId: string, seeded: SeededGallery) {
  const edit = await groupId(studio, projectId, "Foto edit");
  const print = await groupId(studio, projectId, "Foto cetak");
  const target = { context: studio.context, actorId: studio.ownerId, projectId, now: new Date() };
  await runAddOnTransaction(studio.db, async (scope) => {
    const extra = {
      description: "Tambahan 5 foto edit",
      selectionGroupId: edit,
      quantity: "5",
      unitPrice: "50000",
    };
    const created = check("add-on", await createAddOnWithTarget(scope, target, extra));
    done(
      "approve add-on",
      await approveAddOnWithLimit(scope, target, { addOnId: created.addOnId }),
    );
    const album = {
      description: "Album kolase 20x30",
      selectionGroupId: null,
      quantity: "1",
      unitPrice: "750000",
    };
    check("draft add-on", await createAddOnWithTarget(scope, target, album));
  });
  const client = await clientOf(studio, projectId, seeded);
  const deps = selectionDeps(studio);
  const photos = await proofIds(studio, seeded.galleryId, 6);
  check("picks", await setPicks(deps, client, { groupId: edit, photoIds: photos.slice(0, 4) }));
  const note = {
    groupId: edit,
    photoId: photos[0],
    note: "Tolong cerahkan sedikit, hapus jerawat",
  };
  check("pick note", await setPickNote(deps, client, note));
  check(
    "print pick",
    await setPick(deps, client, { groupId: print, photoId: photos[4], quantity: 2 }),
  );
  check(
    "print pick",
    await setPick(deps, client, { groupId: print, photoId: photos[5], quantity: 1 }),
  );
}

async function submitGroup(studio: Studio, client: ClientContext, id: string) {
  const deps = selectionDeps(studio);
  const input = { groupId: id, confirmBelowLimit: false };
  check("submit", await submitSelectionGroup(deps, client, input, new Date()));
}

/** *Wisuda Fajar*: *Foto edit* sent at the limit and locked by the Owner; *Foto cetak* sent, not locked. */
async function seedSubmittedSelection(studio: Studio, projectId: string, seeded: SeededGallery) {
  const edit = await groupId(studio, projectId, "Foto edit");
  const print = await groupId(studio, projectId, "Foto cetak");
  const client = await clientOf(studio, projectId, seeded);
  const deps = selectionDeps(studio);
  const photos = await proofIds(studio, seeded.galleryId, 13);
  check("picks", await setPicks(deps, client, { groupId: edit, photoIds: photos.slice(0, 10) }));
  await submitGroup(studio, client, edit);
  for (const [index, quantity] of [2, 2, 1].entries()) {
    const pick = { groupId: print, photoId: photos[10 + index], quantity };
    check("print pick", await setPick(deps, client, pick));
  }
  await submitGroup(studio, client, print);
  const lock = { selections: deps.selections, now: new Date() };
  const input = { groupId: edit, intent: "LOCK" };
  check("lock", await lockSelectionGroup(lock, studio.context, studio.ownerId, projectId, input));
}

const session = (
  name: string,
  days: number,
  times: readonly [string, string],
  location: string,
  team: readonly TeamPick[],
): SessionSeed => ({ name, days, startTime: times[0], endTime: times[1], location, team });

/** BOOKED with a published gallery, an open selection and add-ons; and a DRAFT. */
async function seedWisuda(studio: Studio, inputs: SeedInputs, links: SeededLinks) {
  const { services, clients, team } = inputs;
  const basic = services["Wisuda Basic"];
  const rina = await createSeedProject(studio, {
    mode: "BOOKED",
    client: clients["Rina Saputri"],
    service: basic,
    title: "Wisuda Rina",
    sessions: [
      session("Wisuda", 7, ["08:00", "11:00"], "Balairung UGM", [
        team("Andi Pratama", "Fotografer"),
      ]),
    ],
    fieldValues: { universitas: "Universitas Gadjah Mada", toga: "Bawa sendiri" },
  });
  console.log("Gallery Wisuda Rina: linking and syncing the Drive folder");
  const rinaGallery = await seedGallery(studio, inputs.env, {
    projectId: rina,
    folder: inputs.env.driveFolder,
    label: "Foto wisuda",
  });
  await seedOpenSelection(studio, rina, rinaGallery);
  links["Wisuda Rina"] = rina;
  links["Wisuda Sari"] = await createSeedProject(studio, {
    mode: "DRAFT",
    client: clients["Sari Wulandari"],
    service: basic,
    title: "Wisuda Sari",
    sessions: [],
  });
}

/** POST_PROCESSING with a sent and locked selection; and a BOOKED one a month ahead. */
async function seedWisudaLater(studio: Studio, inputs: SeedInputs, links: SeededLinks) {
  const { services, clients, team } = inputs;
  const fajar = await createSeedProject(studio, {
    mode: "BOOKED",
    client: clients["Fajar Nugroho"],
    service: services["Wisuda Basic"],
    title: "Wisuda Fajar",
    sessions: [
      session("Wisuda", -14, ["07:30", "10:00"], "Graha Sabha Pramana", [
        team("Bima Santoso", "Fotografer"),
      ]),
    ],
    fieldValues: { universitas: "UNY", toga: "Sewa dari studio" },
  });
  console.log("Gallery Wisuda Fajar: linking and syncing the Drive folder");
  const fajarGallery = await seedGallery(studio, inputs.env, {
    projectId: fajar,
    folder: inputs.env.driveFolder,
    label: "Foto wisuda",
  });
  await seedSubmittedSelection(studio, fajar, fajarGallery);
  await advance(studio, fajar, ["START_SHOOTING", "FINISH_SHOOTING"]);
  links["Wisuda Fajar"] = fajar;
  links["Wisuda Joko"] = await createSeedProject(studio, {
    mode: "BOOKED",
    client: clients["Joko Susilo"],
    service: services["Wisuda Premium"],
    title: "Wisuda Joko",
    sessions: [
      session("Wisuda", 30, ["09:00", "12:00"], "Auditorium UNS", [
        team("Bima Santoso", "Fotografer"),
        team("Citra Lestari", "Asisten"),
      ]),
    ],
  });
}

/** SHOOTING with one session done and one to come; and a two-session BOOKED wedding. */
async function seedEvents(studio: Studio, inputs: SeedInputs, links: SeededLinks) {
  const { services, clients, team } = inputs;
  const dimas = await createSeedProject(studio, {
    mode: "BOOKED",
    client: clients["Dimas & Ayu"],
    service: services["Prewedding Outdoor"],
    title: "Prewedding Dimas & Ayu",
    sessions: [
      session("Sesi outdoor", -1, ["15:00", "18:00"], "Pantai Parangtritis", [
        team("Bima Santoso", "Videografer"),
        team("Citra Lestari", "Asisten"),
      ]),
      session("Sesi indoor", 3, ["10:00", "13:00"], "Studio Contoh", [
        team("Andi Pratama", "Fotografer"),
      ]),
    ],
    fieldValues: { konsep: "Rustic, warna earth tone, bawa kucing", butuh_mua: true },
  });
  await advance(studio, dimas, ["START_SHOOTING"]);
  links["Prewedding Dimas & Ayu"] = dimas;
  const wedding = services["Wedding Full Day"];
  links["Wedding Gita"] = await createSeedProject(studio, {
    mode: "BOOKED",
    client: clients["Gita Permata"],
    service: wedding,
    title: "Wedding Gita",
    notes: "DP 30% sudah masuk. Minta drone kalau cuaca cerah.",
    sessions: [
      session("Akad", 45, ["08:00", "10:00"], "Masjid Agung Kauman", [
        team("Andi Pratama", "Fotografer"),
      ]),
      session("Resepsi", 45, ["11:00", "14:00"], "Gedung Graha Sabha", [
        team("Andi Pratama", "Fotografer"),
        team("Bima Santoso", "Videografer"),
        team("Citra Lestari", "Asisten"),
      ]),
    ],
    fieldValues: { gedung: "Gedung Graha Sabha", tanggal_akad: sessionDate(45) },
  });
}

/** A wedding cancelled from BOOKED with a reason (BR-PRJ-010). */
async function seedCancelled(studio: Studio, inputs: SeedInputs, links: SeededLinks) {
  const indra = await createSeedProject(studio, {
    mode: "BOOKED",
    client: inputs.clients["Indra Wijaya"],
    service: inputs.services["Wedding Full Day"],
    title: "Wedding Indra",
    sessions: [session("Resepsi", 60, ["18:00", "21:00"], "Hotel Tentrem", [])],
    fieldValues: { gedung: "Hotel Tentrem" },
  });
  const projects = createDrizzleProjectRepository(studio.db);
  const reason = { reason: "Acara diundur, tanggal belum pasti" };
  done("cancel", await cancelProject(projects, studio.context, studio.ownerId, indra, reason));
  links["Wedding Indra"] = indra;
}

/** DELIVERED and COMPLETED, only with a folder whose `edited` / `print` subfolders hold files. */
async function seedFinished(studio: Studio, inputs: SeedInputs, links: SeededLinks) {
  const folder = inputs.env.finalDriveFolder;
  if (!folder) {
    console.log(
      "DELIVERED / COMPLETED skipped: set SEED_FINAL_DRIVE_FOLDER to a folder with edited/print subfolders",
    );
    return;
  }
  const { services, clients, team } = inputs;
  const finished = [
    ["Prewedding Kevin & Maya", "Kevin & Maya", "Prewedding Outdoor", { butuh_mua: false }],
    ["Wisuda Lina", "Lina Marlina", "Wisuda Basic", {}],
  ] as const;
  for (const [title, client, service, fieldValues] of finished) {
    const projectId = await createSeedProject(studio, {
      mode: "BOOKED",
      client: clients[client],
      service: services[service],
      title,
      sessions: [
        session("Sesi foto", -30, ["09:00", "12:00"], "Studio Contoh", [
          team("Andi Pratama", "Fotografer"),
        ]),
      ],
      fieldValues,
    });
    console.log(`Gallery ${title}: linking and syncing the final folder`);
    const seeded = await seedGallery(studio, inputs.env, {
      projectId,
      folder,
      label: "Hasil akhir",
    });
    await advance(studio, projectId, ["START_SHOOTING", "FINISH_SHOOTING"]);
    if (!(await publishDeliveryIfFinished(studio, projectId, seeded.sourceId))) continue;
    links[title] = projectId;
  }
  const lina = links["Wisuda Lina"];
  if (!lina) return;
  const projects = createDrizzleProjectRepository(studio.db);
  done(
    "complete",
    await completeProject(projects, studio.context, studio.ownerId, lina, new Date()),
  );
}

/** Seeds every demo project. @returns project ids by title */
export async function seedProjects(studio: Studio, inputs: SeedInputs): Promise<SeededLinks> {
  const links: SeededLinks = {};
  await seedWisuda(studio, inputs, links);
  await seedWisudaLater(studio, inputs, links);
  await seedEvents(studio, inputs, links);
  await seedCancelled(studio, inputs, links);
  await seedFinished(studio, inputs, links);
  return links;
}
