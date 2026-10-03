import { describe, expect, it } from "vitest";

import {
  otherProjectContext,
  PROJECT_IDS,
  projectContext,
  projectFixture,
} from "../../../../../../tests/support/booking/project-fixtures";
import { createProject } from "../create-project/create-project";

const TOKENS = () => "t".repeat(43);

async function seed(mode: "DRAFT" | "BOOKED", status?: string) {
  const repository = projectFixture();
  const result = await createProject(repository, TOKENS, projectContext, "owner", {
    mode,
    clientId: PROJECT_IDS.rina,
    serviceId: PROJECT_IDS.wisudaBasic,
    title: "Wisuda Basic — Rina",
    agreedPrice: "750.000",
    notes: "",
    items: [],
    sessions: [
      { name: "Wisuda", date: "2026-11-10", startTime: null, endTime: null, location: null },
    ],
    fieldValues: { nama_kampus: "UI", tanggal_wisuda: "2026-11-10", ukuran_toga: "" },
  });
  if (!result.ok) throw new Error("not created");
  const stored = repository.projects.find((row) => row.id === result.projectId);
  if (!stored) throw new Error("not stored");
  if (status) stored.status = status as typeof stored.status;
  return { repository, id: result.projectId, stored };
}
import { updateProjectInfo } from "./update-project-info";

const INFO = { title: "Judul baru", agreedPrice: "800.000", notes: " catatan " };

describe("update project info", () => {
  it("AC-PRJ-017 changes title, notes and price while BOOKED", async () => {
    const { repository, id, stored } = await seed("BOOKED");
    expect(await updateProjectInfo(repository, projectContext, "owner", id, INFO)).toBeUndefined();
    expect(stored.input).toMatchObject({
      title: "Judul baru",
      notes: "catatan",
      agreedPrice: "800000",
    });
  });

  it("AC-PRJ-017 keeps title and notes editable but refuses a new price in SHOOTING", async () => {
    const { repository, id, stored } = await seed("BOOKED", "SHOOTING");
    expect(await updateProjectInfo(repository, projectContext, "owner", id, INFO)).toEqual({
      ok: false,
      code: "DEAL_LOCKED",
    });
    const same = { ...INFO, agreedPrice: "750000" };
    expect(await updateProjectInfo(repository, projectContext, "owner", id, same)).toBeUndefined();
    expect(stored.input.title).toBe("Judul baru");
  });

  it("AC-PRJ-018 refuses every edit once cancelled", async () => {
    const { repository, id } = await seed("BOOKED", "CANCELLED");
    expect(await updateProjectInfo(repository, projectContext, "owner", id, INFO)).toEqual({
      ok: false,
      code: "PROJECT_CANCELLED",
    });
  });

  it("AC-PRJ-017 reports field errors and treats a foreign project as not found", async () => {
    const { repository, id } = await seed("BOOKED");
    expect(
      await updateProjectInfo(repository, projectContext, "owner", id, { ...INFO, title: " " }),
    ).toMatchObject({ code: "VALIDATION_FAILED", fieldErrors: { title: "EMPTY" } });
    await expect(
      updateProjectInfo(repository, otherProjectContext, "owner", id, INFO),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
