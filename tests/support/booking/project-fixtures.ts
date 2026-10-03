import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeProjectRepository } from "./fake-project-repository";

export const projectContext = { workspaceId: "projects-workspace" } as unknown as WorkspaceContext;
export const otherProjectContext = {
  workspaceId: "other-workspace",
} as unknown as WorkspaceContext;

export const PROJECT_IDS = {
  rina: "00000000-0000-4000-8000-0000000000a1",
  budi: "00000000-0000-4000-8000-0000000000a2",
  sari: "00000000-0000-4000-8000-0000000000a3",
  category: "00000000-0000-4000-8000-0000000000b1",
  wisudaBasic: "00000000-0000-4000-8000-0000000000c1",
  preweddingOld: "00000000-0000-4000-8000-0000000000c2",
  fotoEdit: "00000000-0000-4000-8000-0000000000d1",
  jumlahOrang: "00000000-0000-4000-8000-0000000000d2",
  fotoCetak: "00000000-0000-4000-8000-0000000000d3",
  albumLama: "00000000-0000-4000-8000-0000000000d4",
} as const;

export const fotoEditItem = {
  id: "item-1",
  definitionId: PROJECT_IDS.fotoEdit,
  definitionName: "Foto edit",
  unit: "foto",
  valueType: "NUMBER",
  selectionRequired: true,
  selectionType: "EDIT",
  value: { type: "NUMBER", value: "25" },
} as const;

export const jumlahOrangItem = {
  id: "item-2",
  definitionId: PROJECT_IDS.jumlahOrang,
  definitionName: "Jumlah orang",
  unit: "orang",
  valueType: "RANGE",
  selectionRequired: false,
  selectionType: null,
  value: { type: "RANGE", min: "1", max: "3" },
} as const;

/** Builds the shared AC fixture on the in-memory project repository. @returns the seeded fake */
export function projectFixture(): FakeProjectRepository {
  const repository = new FakeProjectRepository();
  repository.clients.push(
    { id: PROJECT_IDS.rina, name: "Rina", whatsappNumber: "6281234567890", isArchived: false },
    { id: PROJECT_IDS.budi, name: "Budi", whatsappNumber: null, isArchived: true },
    { id: PROJECT_IDS.sari, name: "Sari", whatsappNumber: null, isArchived: false },
  );
  repository.definitions.push(
    definition(PROJECT_IDS.fotoEdit, "Foto edit", "NUMBER", "foto", "EDIT", true),
    definition(PROJECT_IDS.jumlahOrang, "Jumlah orang", "RANGE", "orang", null, true),
    definition(PROJECT_IDS.fotoCetak, "Foto cetak", "NUMBER", "foto", "PRINT", true),
    definition(PROJECT_IDS.albumLama, "Album lama", "NUMBER", null, null, false),
  );
  repository.services.push(
    {
      id: PROJECT_IDS.wisudaBasic,
      categoryId: PROJECT_IDS.category,
      name: "Wisuda Basic",
      categoryName: "Wisuda",
      basePrice: "750000",
      isActive: true,
      items: [fotoEditItem, jumlahOrangItem],
      fields: [
        {
          key: "nama_kampus",
          name: "Nama kampus",
          fieldType: "TEXT",
          isRequired: true,
          options: null,
        },
        {
          key: "tanggal_wisuda",
          name: "Tanggal wisuda",
          fieldType: "DATE",
          isRequired: true,
          options: null,
        },
        {
          key: "ukuran_toga",
          name: "Ukuran toga",
          fieldType: "SELECT",
          isRequired: false,
          options: ["S", "M", "L"],
        },
      ],
    },
    {
      id: PROJECT_IDS.preweddingOld,
      categoryId: PROJECT_IDS.category,
      name: "Prewed Lama",
      categoryName: "Wisuda",
      basePrice: "1500000",
      isActive: false,
      items: [],
      fields: [],
    },
  );
  return repository;
}

function definition(
  id: string,
  name: string,
  valueType: "NUMBER" | "RANGE",
  unit: string | null,
  selectionType: "EDIT" | "PRINT" | null,
  isActive: boolean,
) {
  return {
    id,
    name,
    valueType,
    unit,
    selectionType,
    selectionRequired: selectionType !== null,
    isActive,
  };
}

/** A valid create input for the fixture (AC-PRJ-008). @param overrides - fields to change @returns the raw input */
export function validCreateInput(overrides: Record<string, unknown> = {}) {
  return {
    mode: "BOOKED",
    clientId: PROJECT_IDS.rina,
    serviceId: PROJECT_IDS.wisudaBasic,
    title: "Wisuda Basic — Rina",
    agreedPrice: "750.000",
    notes: "",
    items: [
      { definitionId: PROJECT_IDS.fotoEdit, value: { type: "NUMBER", value: "25" } },
      { definitionId: PROJECT_IDS.jumlahOrang, value: { type: "RANGE", min: "1", max: "3" } },
    ],
    sessions: [
      {
        name: "Wisuda",
        date: "2026-11-10",
        startTime: "07:30",
        endTime: "10:00",
        location: "Balairung UI, Depok",
      },
    ],
    fieldValues: {
      nama_kampus: "Universitas Indonesia",
      tanggal_wisuda: "2026-11-10",
      ukuran_toga: "",
    },
    ...overrides,
  };
}
