import { describe, expect, it } from "vitest";

import {
  otherProjectContext,
  PROJECT_IDS,
  projectContext,
  projectFixture,
} from "../../../../../../tests/support/booking/project-fixtures";
import { createProject } from "../create-project/create-project";
import {
  addProjectSession,
  deleteProjectSession,
  updateProjectFieldValues,
  updateProjectSession,
} from "./project-field-and-session-edits";
import { addProjectItem, removeProjectItem, updateProjectItemValue } from "./project-item-edits";

const TOKENS = () => "t".repeat(43);
const SESSION = {
  name: "Wisuda",
  date: "2026-11-10",
  startTime: null,
  endTime: null,
  location: null,
};

async function seed(sessions: readonly object[] = [SESSION]) {
  const repository = projectFixture();
  const result = await createProject(repository, TOKENS, projectContext, "owner", {
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
    sessions,
    fieldValues: { nama_kampus: "UI", tanggal_wisuda: "2026-11-10", ukuran_toga: "" },
  });
  if (!result.ok) throw new Error("not created");
  const stored = repository.projects.find((row) => row.id === result.projectId);
  if (!stored) throw new Error("not stored");
  return { repository, id: result.projectId, stored };
}

const fotoEditId = (id: string) => `${id}-item-${PROJECT_IDS.fotoEdit}`;
const orangId = (id: string) => `${id}-item-${PROJECT_IDS.jumlahOrang}`;

describe("deal edits", () => {
  it("AC-PRJ-018 refuses every deal edit once shooting started and changes nothing", async () => {
    const { repository, id, stored } = await seed();
    stored.status = "SHOOTING";
    const locked = { ok: false, code: "DEAL_LOCKED" };
    expect(
      await addProjectItem(repository, projectContext, "o", id, {
        definitionId: PROJECT_IDS.fotoCetak,
        value: { type: "NUMBER", value: "10" },
      }),
    ).toEqual(locked);
    expect(
      await updateProjectItemValue(repository, projectContext, "o", id, fotoEditId(id), {
        value: { type: "NUMBER", value: "30" },
      }),
    ).toEqual(locked);
    expect(await removeProjectItem(repository, projectContext, id, fotoEditId(id))).toEqual(locked);
    expect(
      await updateProjectFieldValues(repository, projectContext, "o", id, {
        values: { nama_kampus: "ITB" },
      }),
    ).toEqual(locked);
    expect(stored.items).toHaveLength(2);
    expect(stored.items[0]?.value).toEqual({ type: "NUMBER", value: "25" });
    expect(stored.fields[0]?.value).toBe("UI");
  });

  it("AC-PRJ-017 appends an active definition with its metadata", async () => {
    const { repository, id, stored } = await seed();
    expect(
      await addProjectItem(repository, projectContext, "o", id, {
        definitionId: PROJECT_IDS.fotoCetak,
        value: { type: "NUMBER", value: "10" },
      }),
    ).toBeUndefined();
    expect(stored.items.at(-1)).toMatchObject({
      name: "Foto cetak",
      unit: "foto",
      pickMode: "QUANTITY",
      allowsPickNotes: false,
      value: { type: "NUMBER", value: "10" },
    });
  });

  it("AC-PRJ-017 rejects a duplicate and an archived definition", async () => {
    const { repository, id } = await seed();
    expect(
      await addProjectItem(repository, projectContext, "o", id, {
        definitionId: PROJECT_IDS.fotoEdit,
        value: { type: "NUMBER", value: "5" },
      }),
    ).toMatchObject({
      code: "VALIDATION_FAILED",
      fieldErrors: { definitionId: "DUPLICATE_DEFINITION" },
    });
    expect(
      await addProjectItem(repository, projectContext, "o", id, {
        definitionId: PROJECT_IDS.albumLama,
        value: { type: "NUMBER", value: "5" },
      }),
    ).toMatchObject({
      code: "VALIDATION_FAILED",
      fieldErrors: { definitionId: "DEFINITION_INACTIVE" },
    });
  });

  it("AC-PRJ-017 validates an edited value against the item's own type", async () => {
    const { repository, id, stored } = await seed();
    expect(
      await updateProjectItemValue(repository, projectContext, "o", id, fotoEditId(id), {
        value: { type: "NUMBER", value: "2,5" },
      }),
    ).toMatchObject({ fieldErrors: { value: "NOT_WHOLE" } });
    expect(
      await updateProjectItemValue(repository, projectContext, "o", id, orangId(id), {
        value: { type: "RANGE", min: "3", max: "1" },
      }),
    ).toMatchObject({ fieldErrors: { max: "MIN_GREATER_THAN_MAX" } });
    expect(
      await updateProjectItemValue(repository, projectContext, "o", id, fotoEditId(id), {
        value: { type: "NUMBER", value: "30" },
      }),
    ).toBeUndefined();
    expect(stored.items[0]?.value).toEqual({ type: "NUMBER", value: "30" });
  });

  it("AC-PRJ-017 removes an item and answers not found for a missing one", async () => {
    const { repository, id, stored } = await seed();
    expect(await removeProjectItem(repository, projectContext, id, orangId(id))).toBeUndefined();
    expect(stored.items).toHaveLength(1);
    await expect(
      removeProjectItem(repository, projectContext, id, "missing"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("AC-PRJ-017 validates booking values and keeps the field metadata", async () => {
    const { repository, id, stored } = await seed();
    expect(
      await updateProjectFieldValues(repository, projectContext, "o", id, {
        values: { ukuran_toga: "XL" },
      }),
    ).toMatchObject({ fieldErrors: { "fieldValues.ukuran_toga": "NOT_AN_OPTION" } });
    expect(
      await updateProjectFieldValues(repository, projectContext, "o", id, {
        values: { nama_kampus: "ITB", tanggal_wisuda: "2026-11-10", ukuran_toga: "M" },
      }),
    ).toBeUndefined();
    expect(stored.fields.map((field) => [field.name, field.value])).toEqual([
      ["Nama kampus", "ITB"],
      ["Tanggal wisuda", "2026-11-10"],
      ["Ukuran toga", "M"],
    ]);
  });

  it("AC-PRJ-025 treats another workspace's project as not found", async () => {
    const { repository, id } = await seed();
    await expect(
      removeProjectItem(repository, otherProjectContext, id, fotoEditId(id)),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("session edits", () => {
  it("AC-PRJ-029 adds and changes a session", async () => {
    const { repository, id, stored } = await seed();
    expect(
      await addProjectSession(repository, projectContext, "o", id, { ...SESSION, name: "Foto" }),
    ).toBeUndefined();
    expect(stored.sessions).toHaveLength(2);
    const sessionId = stored.sessions[0]?.id ?? "";
    expect(
      await updateProjectSession(repository, projectContext, "o", id, sessionId, {
        ...SESSION,
        name: "Baru",
      }),
    ).toBeUndefined();
    expect(stored.sessions[0]?.name).toBe("Baru");
  });

  it("AC-PRJ-029 keeps the last session of a booked project", async () => {
    const { repository, id, stored } = await seed();
    const only = stored.sessions[0]?.id ?? "";
    expect(await deleteProjectSession(repository, projectContext, id, only)).toEqual({
      ok: false,
      code: "LAST_SESSION",
    });
    await addProjectSession(repository, projectContext, "o", id, { ...SESSION, name: "Foto" });
    expect(await deleteProjectSession(repository, projectContext, id, only)).toBeUndefined();
    expect(stored.sessions).toHaveLength(1);
  });

  it("AC-PRJ-029 refuses any session change once cancelled", async () => {
    const { repository, id, stored } = await seed();
    stored.status = "CANCELLED";
    const refused = { ok: false, code: "PROJECT_CANCELLED" };
    expect(await addProjectSession(repository, projectContext, "o", id, SESSION)).toEqual(refused);
    expect(await updateProjectSession(repository, projectContext, "o", id, "x", SESSION)).toEqual(
      refused,
    );
    expect(await deleteProjectSession(repository, projectContext, id, "x")).toEqual(refused);
  });

  it("AC-PRJ-029 reports session field errors", async () => {
    const { repository, id } = await seed();
    expect(
      await addProjectSession(repository, projectContext, "o", id, { ...SESSION, name: " " }),
    ).toMatchObject({ code: "VALIDATION_FAILED", fieldErrors: { name: "EMPTY" } });
  });
});
