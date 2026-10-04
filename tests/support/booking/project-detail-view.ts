import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import { buildProjectMenu } from "@/features/booking/domain/project-menu/project-menu";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";

export const STEP: Record<ProjectStatus, ProjectDetailView["nextStep"]> = {
  DRAFT: "CONFIRM_BOOKING",
  BOOKED: "START_SHOOTING",
  SHOOTING: "FINISH_SHOOTING",
  POST_PROCESSING: null,
  DELIVERED: null,
  COMPLETED: null,
  CANCELLED: null,
};

/** A project detail view for a status (two sessions, two items, two fields). @param status - stored status @param overrides - fields to change @returns the view */
export function projectDetailView(
  status: ProjectStatus,
  overrides: Partial<ProjectDetailView> = {},
): ProjectDetailView {
  const sessions = [
    {
      id: "s1",
      name: "Foto keluarga",
      date: "2026-11-10",
      startTime: "06:30",
      endTime: "07:15",
      location: "Rumah Rina, Depok",
      createdAt: "2026-10-01T00:00:00Z",
    },
    {
      id: "s2",
      name: "Wisuda",
      date: "2026-11-10",
      startTime: "07:30",
      endTime: "10:00",
      location: "Balairung UI, Depok",
      createdAt: "2026-10-01T00:00:01Z",
    },
  ];
  return {
    id: "p1",
    title: "Wisuda Basic — Rina",
    notes: "Keluarga datang dari Bandung.",
    agreedPrice: "700000",
    currency: "IDR",
    status,
    client: { id: "c1", name: "Rina", whatsappNumber: "6281234567890" },
    service: { id: "sv1", name: "Wisuda Basic", basePrice: "750000" },
    items: [
      {
        id: "i1",
        definitionId: "d1",
        name: "Foto edit",
        unit: "foto",
        valueType: "NUMBER",
        selectionRequired: true,
        selectionType: "EDIT",
        value: { type: "NUMBER", value: "25" },
      },
    ],
    fields: [
      {
        id: "f1",
        key: "nama_kampus",
        name: "Nama kampus",
        fieldType: "TEXT",
        isRequired: true,
        options: null,
        value: "Universitas Indonesia",
      },
      {
        id: "f2",
        key: "ukuran_toga",
        name: "Ukuran toga",
        fieldType: "SELECT",
        isRequired: false,
        options: ["S"],
        value: null,
      },
    ],
    sessions,
    assignments: [],
    cancellation: null,
    shownSession: { session: sessions[0], extraCount: 1, isPast: false },
    nextStep: STEP[status],
    canEditDeal: status === "DRAFT" || status === "BOOKED",
    canEditSchedule: status !== "CANCELLED",
    canEditInfo: status !== "CANCELLED",
    canEditTeam: status !== "CANCELLED",
    menu: buildProjectMenu({ status, hasWhatsappNumber: true }),
    ...overrides,
  };
}
