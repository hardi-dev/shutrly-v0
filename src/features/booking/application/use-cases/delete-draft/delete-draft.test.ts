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
import { deleteDraft } from "./delete-draft";

describe("delete draft", () => {
  it("AC-PRJ-023 deletes a draft and returns its title", async () => {
    const { repository, id } = await seed("DRAFT");
    expect(await deleteDraft(repository, projectContext, id)).toEqual({
      ok: true,
      title: "Wisuda Basic — Rina",
    });
    expect(repository.projects).toHaveLength(0);
  });

  it("AC-PRJ-023 refuses to delete a booked project", async () => {
    const { repository, id } = await seed("BOOKED");
    expect(await deleteDraft(repository, projectContext, id)).toEqual({ ok: false, code: "STALE" });
    expect(repository.projects).toHaveLength(1);
  });

  it("AC-PRJ-025 treats a foreign project as not found", async () => {
    const { repository, id } = await seed("DRAFT");
    await expect(deleteDraft(repository, otherProjectContext, id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
