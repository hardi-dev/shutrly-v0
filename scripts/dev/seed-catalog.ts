// The demo studio's catalog, clients and team for `pnpm db:seed`, all through the app's use cases.
import { createDrizzleCategoryRepository } from "@/adapters/db/catalog-repository/drizzle-category-repository";
import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import { createDrizzleServiceRepository } from "@/adapters/db/catalog-repository/drizzle-service-repository";
import { createDrizzleClientRepository } from "@/adapters/db/client-repository/drizzle-client-repository";
import { createDrizzleTeamMemberRepository } from "@/adapters/db/team-repository/drizzle-team-member-repository";
import { createDrizzleTeamRoleRepository } from "@/adapters/db/team-repository/drizzle-team-role-repository";
import { addBookingField } from "@/features/booking/application/use-cases/add-booking-field/add-booking-field";
import { addCategory } from "@/features/booking/application/use-cases/add-category/add-category";
import { addClient } from "@/features/booking/application/use-cases/add-client/add-client";
import { addService } from "@/features/booking/application/use-cases/add-service/add-service";
import { addServiceItem } from "@/features/booking/application/use-cases/add-service-item/add-service-item";
import { addTeamMember } from "@/features/booking/application/use-cases/add-team-member/add-team-member";
import { listTeamRoles } from "@/features/booking/application/use-cases/list-team-roles/list-team-roles";
import { setClientArchived } from "@/features/booking/application/use-cases/set-client-archived/set-client-archived";
import { setServiceActive } from "@/features/booking/application/use-cases/set-service-active/set-service-active";
import { setTeamMemberArchived } from "@/features/booking/application/use-cases/set-team-member-archived/set-team-member-archived";

import { check, definitionId, present, type Studio } from "./seed-support";

/** Package items as `[definition name, value]`, the same shape a project copies. */
export type ItemValues = readonly (readonly [string, string])[];

interface FieldSeed {
  readonly name: string;
  readonly fieldType: "TEXT" | "TEXTAREA" | "DATE" | "BOOLEAN" | "SELECT";
  readonly isRequired: boolean;
  readonly options?: readonly string[];
}

interface ServiceSeed {
  readonly name: string;
  readonly basePrice: string;
  readonly items: ItemValues;
  readonly fields?: readonly FieldSeed[];
  readonly inactive?: boolean;
}

export interface SeededService {
  readonly id: string;
  readonly price: string;
  readonly items: ItemValues;
}

// Field keys derive from the names (fieldKeyFromName): universitas, toga, konsep, butuh_mua, gedung, tanggal_akad.
const CATALOG: Readonly<Record<string, readonly ServiceSeed[]>> = {
  Wisuda: [
    {
      name: "Wisuda Basic",
      basePrice: "1500000",
      items: [
        ["Foto edit", "10"],
        ["Foto cetak", "5"],
      ],
      fields: [
        { name: "Universitas", fieldType: "TEXT", isRequired: false },
        {
          name: "Toga",
          fieldType: "SELECT",
          isRequired: false,
          options: ["Bawa sendiri", "Sewa dari studio"],
        },
      ],
    },
    {
      name: "Wisuda Premium",
      basePrice: "2500000",
      items: [
        ["Foto edit", "25"],
        ["Foto cetak", "10"],
        ["Durasi pemotretan", "2"],
      ],
    },
    { name: "Wisuda Hemat 2023", basePrice: "900000", items: [["Foto edit", "5"]], inactive: true },
  ],
  Prewedding: [
    {
      name: "Prewedding Outdoor",
      basePrice: "4500000",
      items: [
        ["Foto edit", "30"],
        ["Foto cetak", "10"],
        ["Durasi pemotretan", "4"],
      ],
      fields: [
        { name: "Konsep", fieldType: "TEXTAREA", isRequired: false },
        { name: "Butuh MUA", fieldType: "BOOLEAN", isRequired: true },
      ],
    },
  ],
  Wedding: [
    {
      name: "Wedding Full Day",
      basePrice: "12000000",
      items: [
        ["Foto edit", "80"],
        ["Foto cetak", "30"],
        ["Durasi pemotretan", "8"],
      ],
      fields: [
        { name: "Gedung", fieldType: "TEXT", isRequired: true },
        { name: "Tanggal akad", fieldType: "DATE", isRequired: false },
      ],
    },
  ],
};

async function seedService(studio: Studio, categoryId: string, seed: ServiceSeed) {
  const { db, context, ownerId } = studio;
  const services = createDrizzleServiceRepository(db);
  const definitions = createDrizzleItemDefinitionRepository(db);
  const created = check(
    `service ${seed.name}`,
    await addService(
      services,
      context,
      ownerId,
      {
        name: seed.name,
        categoryId,
        basePrice: seed.basePrice,
      },
      // Seed data is written in Indonesian (the seeded owner's catalog text).
      "id-ID",
    ),
  );
  const id = present("service id", created.serviceId);
  for (const [name, value] of seed.items) {
    const definition = await definitionId(studio, name);
    check(
      `service item ${seed.name} / ${name}`,
      await addServiceItem(services, definitions, context, id, definition, ownerId, {
        type: "NUMBER",
        value,
      }),
    );
  }
  for (const field of seed.fields ?? []) {
    const input = { ...field, options: field.options ? [...field.options] : null };
    check(
      `booking field ${field.name}`,
      await addBookingField(services, context, id, ownerId, input),
    );
  }
  if (seed.inactive) await setServiceActive(services, context, id, ownerId, false);
  return id;
}

/** Three categories with five services (one inactive) and booking fields; keyed by service name. */
export async function seedCatalog(
  studio: Studio,
): Promise<Readonly<Record<string, SeededService>>> {
  const categories = createDrizzleCategoryRepository(studio.db);
  const seeded: Record<string, SeededService> = {};
  for (const [categoryName, services] of Object.entries(CATALOG)) {
    const category = check(
      `category ${categoryName}`,
      await addCategory(categories, studio.context, studio.ownerId, { name: categoryName }),
    );
    const categoryId = present("category id", category.categoryId);
    for (const service of services) {
      const id = await seedService(studio, categoryId, service);
      seeded[service.name] = { id, price: service.basePrice, items: service.items };
    }
  }
  return seeded;
}

type SocialLink = {
  readonly platform: "INSTAGRAM" | "TIKTOK" | "FACEBOOK";
  readonly value: string;
};

const CLIENTS: readonly (readonly [string, string | null, readonly SocialLink[]])[] = [
  ["Rina Saputri", "0812-3456-7890", [{ platform: "INSTAGRAM", value: "rinasaputri" }]],
  ["Sari Wulandari", "0813-2222-3333", []],
  [
    "Joko Susilo",
    "0815-7777-1212",
    [{ platform: "FACEBOOK", value: "https://facebook.com/joko.susilo" }],
  ],
  [
    "Dimas & Ayu",
    "0817-4444-5555",
    [
      { platform: "INSTAGRAM", value: "dimas.ayu.story" },
      { platform: "TIKTOK", value: "dimasayu" },
    ],
  ],
  ["Fajar Nugroho", "0818-6666-1010", [{ platform: "INSTAGRAM", value: "fajarnugroho" }]],
  ["Gita Permata", "0819-1234-0000", [{ platform: "INSTAGRAM", value: "gitapermata" }]],
  ["Indra Wijaya", "0821-5555-8080", []],
  ["Kevin & Maya", "0822-3030-4040", [{ platform: "INSTAGRAM", value: "kevinmaya.wed" }]],
  ["Lina Marlina", "0823-9090-1111", []],
  ["Hendra Gunawan", null, []],
];

// Archived: no project uses it, so it shows only under the archive filter.
const ARCHIVED_CLIENT = "Hendra Gunawan";

/** Ten clients with social links, one without WhatsApp and archived; keyed by name. */
export async function seedClients(studio: Studio): Promise<Readonly<Record<string, string>>> {
  const repository = createDrizzleClientRepository(studio.db);
  const ids: Record<string, string> = {};
  for (const [name, whatsappNumber, socialLinks] of CLIENTS) {
    const result = check(
      `client ${name}`,
      await addClient(repository, studio.context, studio.ownerId, {
        name,
        whatsappNumber: whatsappNumber ?? "",
        socialLinks: [...socialLinks],
      }),
    );
    ids[name] = present("client id", result.client).id;
  }
  await setClientArchived(repository, studio.context, studio.ownerId, ids[ARCHIVED_CLIENT], true);
  return ids;
}

export interface TeamPick {
  readonly memberId: string;
  readonly roleId: string;
}

/** Puts a seeded member on a session in one of their roles. */
export type Team = (member: string, role: string) => TeamPick;

const MEMBERS: readonly (readonly [string, string, string, readonly string[]])[] = [
  ["Andi Pratama", "0811-1111-0001", "andi@shutrly.test", ["Fotografer"]],
  ["Bima Santoso", "0811-1111-0002", "", ["Fotografer", "Videografer"]],
  ["Citra Lestari", "0811-1111-0003", "citra@shutrly.test", ["Asisten"]],
  ["Dodi Kurniawan", "0811-1111-0004", "", ["Videografer"]],
];

// Archived, so *Atur tim* doesn't offer him; he has no assignment.
const ARCHIVED_MEMBER = "Dodi Kurniawan";

/** Four members on the seeded roles (one archived). @returns a picker for session teams */
export async function seedTeam(studio: Studio): Promise<Team> {
  const { db, context, ownerId } = studio;
  const roles = await listTeamRoles(createDrizzleTeamRoleRepository(db), context);
  const roleId = (name: string) =>
    present(
      `role ${name}`,
      roles.find((role) => role.name === name),
    ).id;
  const members = createDrizzleTeamMemberRepository(db);
  const memberIds: Record<string, string> = {};
  for (const [name, whatsappNumber, email, roleNames] of MEMBERS) {
    const result = check(
      `member ${name}`,
      await addTeamMember(members, context, ownerId, {
        name,
        whatsappNumber,
        email,
        roleIds: roleNames.map(roleId),
      }),
    );
    memberIds[name] = present("member id", result.member).id;
  }
  await setTeamMemberArchived(members, context, ownerId, memberIds[ARCHIVED_MEMBER], true);
  return (member, role) => ({
    memberId: present(`member ${member}`, memberIds[member]),
    roleId: roleId(role),
  });
}
