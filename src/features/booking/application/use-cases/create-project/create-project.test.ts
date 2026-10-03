import { describe, expect, it } from "vitest";

import {
  otherProjectContext,
  PROJECT_IDS,
  projectContext,
  projectFixture,
  validCreateInput,
} from "../../../../../../tests/support/booking/project-fixtures";
import { ProjectError } from "../../errors/project-errors/project-errors";
import { createProject } from "./create-project";

const TOKEN = "A".repeat(43);
const generate = () => TOKEN;

function setup() {
  const repository = projectFixture();
  const create = (input: unknown, context = projectContext) =>
    createProject(repository, generate, context, "owner-1", input);
  return { repository, create };
}

describe("create project (BR-PRJ-001, BR-PRJ-002, BR-PRJ-008)", () => {
  it("AC-PRJ-008 snapshots the package, values and sessions and returns only the id", async () => {
    const { repository, create } = setup();
    const result = await create(validCreateInput());
    expect(result).toEqual({ ok: true, projectId: "project-1" });
    const stored = repository.projects.at(0)?.input;
    expect(stored).toMatchObject({
      status: "BOOKED",
      agreedPrice: "750000",
      notes: null,
      accessToken: TOKEN,
      actorId: "owner-1",
    });
    expect(stored?.items).toHaveLength(2);
    expect(stored?.fieldValues).toEqual({
      nama_kampus: "Universitas Indonesia",
      tanggal_wisuda: "2026-11-10",
      ukuran_toga: null,
    });
    expect(stored?.sessions).toEqual([
      {
        name: "Wisuda",
        date: "2026-11-10",
        startTime: "07:30",
        endTime: "10:00",
        location: "Balairung UI, Depok",
      },
    ]);
  });

  it("AC-PRJ-029 rejects BOOKED without a session but creates a DRAFT without one", async () => {
    const { repository, create } = setup();
    expect(await create(validCreateInput({ sessions: [] }))).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { sessions: "SESSION_REQUIRED" },
    });
    expect(repository.projects).toHaveLength(0);
    const draft = await create(validCreateInput({ mode: "DRAFT", sessions: [] }));
    expect(draft).toEqual({ ok: true, projectId: "project-1" });
    expect(repository.projects.at(0)?.input.status).toBe("DRAFT");
  });

  it("AC-PRJ-010, AC-PRJ-011 reports title, campus and price problems together", async () => {
    const { repository, create } = setup();
    const result = await create(
      validCreateInput({
        title: " ",
        agreedPrice: "-5",
        fieldValues: { nama_kampus: "", tanggal_wisuda: "2026-11-10", ukuran_toga: "XL" },
      }),
    );
    expect(result).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: {
        title: "EMPTY",
        agreedPrice: "NEGATIVE",
        "fieldValues.nama_kampus": "REQUIRED",
        "fieldValues.ukuran_toga": "NOT_AN_OPTION",
      },
    });
    expect(repository.projects).toHaveLength(0);
  });

  it("AC-PRJ-017 reports item problems on their index", async () => {
    const { create } = setup();
    const result = await create(
      validCreateInput({
        items: [
          { definitionId: PROJECT_IDS.fotoEdit, value: { type: "NUMBER", value: "2,5" } },
          { definitionId: PROJECT_IDS.fotoEdit, value: { type: "NUMBER", value: "3" } },
        ],
      }),
    );
    expect(result).toMatchObject({
      ok: false,
      fieldErrors: {
        "items.0.value": "NOT_WHOLE",
        "items.1.definitionId": "DUPLICATE_DEFINITION",
      },
    });
  });

  it("C-004 ignores a status, currency or token sent by the client", async () => {
    const { repository, create } = setup();
    await create(
      validCreateInput({
        status: "COMPLETED",
        currency: "USD",
        clientAccessToken: "x",
        workspaceId: "w",
      }),
    );
    expect(repository.projects.at(0)?.input).toMatchObject({
      status: "BOOKED",
      accessToken: TOKEN,
    });
  });

  it("AC-PRJ-012 refuses an archived client and an inactive service", async () => {
    const { create } = setup();
    expect(await create(validCreateInput({ clientId: PROJECT_IDS.budi }))).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { clientId: "CLIENT_INACTIVE" },
    });
    expect(
      await create(validCreateInput({ serviceId: PROJECT_IDS.preweddingOld, fieldValues: {} })),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { serviceId: "SERVICE_INACTIVE" },
    });
  });

  it("AC-PRJ-012 treats a service of another workspace as not found", async () => {
    const { create } = setup();
    await expect(create(validCreateInput(), otherProjectContext)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(create(validCreateInput(), otherProjectContext)).rejects.toBeInstanceOf(
      ProjectError,
    );
  });

  it("AC-PRJ-012 refuses an inactive definition that the service does not use", async () => {
    const { create } = setup();
    const result = await create(
      validCreateInput({
        items: [{ definitionId: PROJECT_IDS.albumLama, value: { type: "NUMBER", value: "1" } }],
      }),
    );
    expect(result).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { "items.0.definitionId": "DEFINITION_INACTIVE" },
    });
  });

  it("AC-PRJ-017 accepts an extra active definition and an unknown one is invalid", async () => {
    const { create } = setup();
    const extra = await create(
      validCreateInput({
        items: [{ definitionId: PROJECT_IDS.fotoCetak, value: { type: "NUMBER", value: "10" } }],
      }),
    );
    expect(extra).toMatchObject({ ok: true });
    const unknown = await create(
      validCreateInput({
        items: [
          {
            definitionId: "00000000-0000-4000-8000-0000000000ff",
            value: { type: "NUMBER", value: "1" },
          },
        ],
      }),
    );
    expect(unknown).toMatchObject({
      ok: false,
      fieldErrors: { "items.0.definitionId": "INVALID" },
    });
  });
});
