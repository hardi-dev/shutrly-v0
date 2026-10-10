import { describe, expect, it } from "vitest";

import {
  otherProjectContext,
  PROJECT_IDS,
  projectContext,
  projectFixture,
} from "../../../../../../tests/support/booking/project-fixtures";
import { createProject } from "../create-project/create-project";
import { advanceProject } from "./advance-project";

const TOKENS = () => "t".repeat(43);
const SESSION = {
  name: "Wisuda",
  date: "2026-11-10",
  startTime: null,
  endTime: null,
  location: null,
};

async function seed(mode: "DRAFT" | "BOOKED", sessions: readonly object[]) {
  const repository = projectFixture();
  const result = await createProject(
    repository,
    TOKENS,
    projectContext,
    "owner",
    {
      mode,
      clientId: PROJECT_IDS.rina,
      serviceId: PROJECT_IDS.wisudaBasic,
      title: "Wisuda Basic — Rina",
      agreedPrice: "750.000",
      notes: "",
      items: [],
      sessions,
      fieldValues: { nama_kampus: "UI", tanggal_wisuda: "2026-11-10", ukuran_toga: "" },
    },
    "id-ID",
  );
  if (!result.ok) throw new Error("not created");
  const stored = repository.projects.find((row) => row.id === result.projectId);
  if (!stored) throw new Error("not stored");
  return { repository, id: result.projectId, stored };
}

describe("advance project", () => {
  it("AC-PRJ-009 confirms a draft that has a session", async () => {
    const { repository, id, stored } = await seed("DRAFT", [SESSION]);
    expect(
      await advanceProject(repository, projectContext, "owner", id, "CONFIRM_BOOKING"),
    ).toBeUndefined();
    expect(stored.status).toBe("BOOKED");
  });

  it("AC-PRJ-009 refuses to confirm a draft without a session", async () => {
    const { repository, id, stored } = await seed("DRAFT", []);
    expect(
      await advanceProject(repository, projectContext, "owner", id, "CONFIRM_BOOKING"),
    ).toEqual({ ok: false, code: "SESSION_REQUIRED" });
    expect(stored.status).toBe("DRAFT");
  });

  it("AC-PRJ-020 walks BOOKED to SHOOTING to POST_PROCESSING", async () => {
    const { repository, id, stored } = await seed("BOOKED", [SESSION]);
    await advanceProject(repository, projectContext, "owner", id, "START_SHOOTING");
    expect(stored.status).toBe("SHOOTING");
    await advanceProject(repository, projectContext, "owner", id, "FINISH_SHOOTING");
    expect(stored.status).toBe("POST_PROCESSING");
  });

  it("AC-PRJ-021 answers STALE when the stored status is not the step's origin", async () => {
    const { repository, id, stored } = await seed("BOOKED", [SESSION]);
    expect(
      await advanceProject(repository, projectContext, "owner", id, "FINISH_SHOOTING"),
    ).toEqual({ ok: false, code: "STALE" });
    stored.status = "CANCELLED";
    expect(await advanceProject(repository, projectContext, "owner", id, "START_SHOOTING")).toEqual(
      { ok: false, code: "STALE" },
    );
    expect(stored.status).toBe("CANCELLED");
  });

  it("AC-PRJ-025 treats a forged step and a foreign project as not found", async () => {
    const { repository, id } = await seed("BOOKED", [SESSION]);
    await expect(
      advanceProject(repository, projectContext, "owner", id, "DELIVER"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      advanceProject(repository, otherProjectContext, "owner", id, "START_SHOOTING"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
