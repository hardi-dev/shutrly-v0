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
      sessions: [
        { name: "Wisuda", date: "2026-11-10", startTime: null, endTime: null, location: null },
      ],
      fieldValues: { nama_kampus: "UI", tanggal_wisuda: "2026-11-10", ukuran_toga: "" },
    },
    "id-ID",
  );
  if (!result.ok) throw new Error("not created");
  const stored = repository.projects.find((row) => row.id === result.projectId);
  if (!stored) throw new Error("not stored");
  if (status) stored.status = status as typeof stored.status;
  return { repository, id: result.projectId, stored };
}
import { cancelProject } from "./cancel-project";

describe("cancel project", () => {
  it("AC-PRJ-022 cancels a BOOKED project without a reason", async () => {
    const { repository, id, stored } = await seed("BOOKED");
    expect(
      await cancelProject(repository, projectContext, "owner", id, { reason: "" }),
    ).toBeUndefined();
    expect(stored.status).toBe("CANCELLED");
    expect(stored.cancellation?.reason).toBeNull();
  });

  it("AC-PRJ-022 requires a reason from SHOOTING", async () => {
    const { repository, id, stored } = await seed("BOOKED", "SHOOTING");
    expect(await cancelProject(repository, projectContext, "owner", id, { reason: "  " })).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { reason: "REASON_REQUIRED" },
    });
    expect(stored.status).toBe("SHOOTING");
    expect(
      await cancelProject(repository, projectContext, "owner", id, { reason: "klien batal" }),
    ).toBeUndefined();
    expect(stored.cancellation?.reason).toBe("klien batal");
  });

  it("AC-PRJ-022 rejects a reason over 500 characters", async () => {
    const { repository, id } = await seed("BOOKED");
    expect(
      await cancelProject(repository, projectContext, "owner", id, { reason: "a".repeat(501) }),
    ).toMatchObject({ code: "VALIDATION_FAILED", fieldErrors: { reason: "TOO_LONG" } });
  });

  it("AC-PRJ-022 answers STALE for a draft or an already cancelled project", async () => {
    const draft = await seed("DRAFT");
    expect(
      await cancelProject(draft.repository, projectContext, "owner", draft.id, { reason: "x" }),
    ).toEqual({ ok: false, code: "STALE" });
    const cancelled = await seed("BOOKED", "CANCELLED");
    expect(
      await cancelProject(cancelled.repository, projectContext, "owner", cancelled.id, {
        reason: "x",
      }),
    ).toEqual({ ok: false, code: "STALE" });
  });

  it("AC-PRJ-025 treats a foreign project as not found", async () => {
    const { repository, id } = await seed("BOOKED");
    await expect(
      cancelProject(repository, otherProjectContext, "owner", id, { reason: "x" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
