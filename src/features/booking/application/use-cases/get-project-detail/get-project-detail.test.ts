import { describe, expect, it, vi } from "vitest";

import {
  otherProjectContext,
  PROJECT_IDS,
  projectContext,
  projectFixture,
} from "../../../../../../tests/support/booking/project-fixtures";
import { createProject } from "../create-project/create-project";
import { getProjectDetail } from "./get-project-detail";

const TOKENS = () => "t".repeat(43);

async function seed(mode: "DRAFT" | "BOOKED", sessions: readonly object[] = SESSIONS) {
  const repository = projectFixture();
  const input = {
    mode,
    clientId: PROJECT_IDS.rina,
    serviceId: PROJECT_IDS.wisudaBasic,
    title: "Wisuda Basic — Rina",
    agreedPrice: "750.000",
    notes: "",
    items: [],
    sessions,
    fieldValues: { nama_kampus: "UI", tanggal_wisuda: "2026-11-10", ukuran_toga: "" },
  };
  const result = await createProject(repository, TOKENS, projectContext, "owner", input);
  if (!result.ok) throw new Error("not created");
  return { repository, id: result.projectId };
}

const SESSIONS = [
  { name: "Foto keluarga", date: "2026-11-10", startTime: "06:30", endTime: null, location: null },
  { name: "Wisuda", date: "2026-11-10", startTime: "07:30", endTime: null, location: null },
];

describe("get project detail", () => {
  it("AC-PRJ-025 throws NOT_FOUND when the project is missing or in another workspace", async () => {
    const { repository, id } = await seed("BOOKED");
    await expect(
      getProjectDetail(repository, projectContext, "missing", "2026-11-01"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      getProjectDetail(repository, otherProjectContext, id, "2026-11-01"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("AC-PRJ-015 AC-PRJ-018 shows the next session and counts the others", async () => {
    const { repository, id } = await seed("BOOKED");
    const view = await getProjectDetail(repository, projectContext, id, "2026-11-01");
    expect(view.shownSession).toMatchObject({ extraCount: 1, isPast: false });
    expect(view.shownSession?.session.name).toBe("Foto keluarga");
    const past = await getProjectDetail(repository, projectContext, id, "2026-12-01");
    expect(past.shownSession).toMatchObject({ isPast: true });
    expect(past.shownSession?.session.name).toBe("Wisuda");
  });

  it("AC-PRJ-018 has no shown session for a draft without sessions", async () => {
    const { repository, id } = await seed("DRAFT", []);
    const view = await getProjectDetail(repository, projectContext, id, "2026-11-01");
    expect(view.shownSession).toBeNull();
    expect(view.nextStep).toBe("CONFIRM_BOOKING");
  });

  it("AC-PRJ-015 AC-PRJ-016 derives the step and edit flags from every status", async () => {
    const { repository, id } = await seed("BOOKED");
    const expected = [
      ["DRAFT", "CONFIRM_BOOKING", true, true],
      ["BOOKED", "START_SHOOTING", true, true],
      ["SHOOTING", "FINISH_SHOOTING", false, true],
      ["POST_PROCESSING", null, false, true],
      ["DELIVERED", null, false, true],
      ["COMPLETED", null, false, true],
      ["CANCELLED", null, false, false],
    ] as const;
    for (const [status, step, deal, schedule] of expected) {
      const stored = repository.projects.find((row) => row.id === id);
      if (stored) stored.status = status;
      const view = await getProjectDetail(repository, projectContext, id, "2026-11-01");
      expect([view.nextStep, view.canEditDeal, view.canEditSchedule, view.canEditInfo]).toEqual([
        step,
        deal,
        schedule,
        schedule,
      ]);
    }
  });

  it("AC-TEAM-015 lets the team be edited in every status but CANCELLED", async () => {
    const { repository, id } = await seed("BOOKED");
    const booked = await getProjectDetail(repository, projectContext, id, "2026-10-04");
    expect(booked.canEditTeam).toBe(true);
    expect(booked.assignments).toEqual([]);
    const cancelled = { ...booked, status: "CANCELLED" } as const;
    vi.spyOn(repository, "findDetail").mockResolvedValue(cancelled);
    expect((await getProjectDetail(repository, projectContext, id, "2026-10-04")).canEditTeam).toBe(
      false,
    );
  });
});
