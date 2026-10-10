import { describe, expect, it } from "vitest";

import { sourceRowText } from "./source-text";

const SOURCE = {
  id: "s-1",
  name: "Rina-Wisuda",
  label: null,
  workspaceSourceName: "Google Drive",
  removed: false,
  removedAt: null,
  syncStatus: "SUCCEEDED" as const,
  syncErrorCode: null,
  lastSyncedAt: "2026-10-04T04:02:00Z",
  proofCount: 4,
  editedCount: 3,
  printCount: 1,
  ignoredCount: 2,
  missingCount: 0,
  tooDeepCount: 0,
};
const DESKTOP = { isArchived: false, isReadOnly: false, isMobile: false };
const PHONE = { ...DESKTOP, isMobile: true };

describe("sourceRowText", () => {
  it("AC-GAL-005 shows Berhasil, the sync time and the counts", () => {
    expect(sourceRowText(SOURCE, null, null, DESKTOP, "id-ID")).toEqual({
      title: "Rina-Wisuda",
      meta: "Google Drive · Disinkronkan Min, 4 Okt 2026 · 11.02 · 4 proof · 4 hasil akhir · 2 diabaikan",
      metaTone: "default",
      chip: { tone: "success", label: "Berhasil", hasDot: true },
    });
  });

  it("design leaves out kinds with no photos and keeps phone rows short", () => {
    const only = { ...SOURCE, editedCount: 0, printCount: 0, ignoredCount: 0 };
    expect(sourceRowText(only, null, null, DESKTOP, "id-ID").meta).toBe(
      "Google Drive · Disinkronkan Min, 4 Okt 2026 · 11.02 · 4 proof",
    );
    expect(sourceRowText(SOURCE, null, null, PHONE, "id-ID").meta).toBe(
      "4 proof · 4 hasil akhir · 11.02",
    );
  });

  it("AC-GAL-007 AC-GAL-030 adds the missing and too-deep counts", () => {
    const text = sourceRowText(
      { ...SOURCE, missingCount: 1, ignoredCount: 0, tooDeepCount: 1 },
      null,
      null,
      DESKTOP,
      "id-ID",
    );
    expect(text.meta).toContain("4 proof · 1 hilang · 4 hasil akhir · 1 folder terlalu dalam");
  });

  it("AC-GAL-008 shows Gagal with the sharing hint in danger", () => {
    const failed = {
      ...SOURCE,
      syncStatus: "FAILED" as const,
      syncErrorCode: "NOT_PUBLIC" as const,
    };
    const text = sourceRowText(failed, null, null, DESKTOP, "id-ID");
    expect(text.chip).toMatchObject({ tone: "danger", label: "Gagal" });
    expect(text.metaTone).toBe("danger");
    expect(text.meta).toContain("Siapa saja yang memiliki link");
  });

  it("D-9 shows the running and queued phases", () => {
    expect(sourceRowText(SOURCE, "SYNCING", null, DESKTOP, "id-ID")).toMatchObject({
      meta: "Google Drive · Menyinkronkan…",
      chip: { tone: "info", label: "Menyinkronkan" },
    });
    expect(sourceRowText(SOURCE, "QUEUED", null, DESKTOP, "id-ID").meta).toBe(
      "Google Drive · Menunggu giliran…",
    );
  });

  it("AC-GAL-032 shows how many folders a running sync has read", () => {
    expect(
      sourceRowText(SOURCE, "SYNCING", { foldersDone: 40, foldersTotal: 95 }, DESKTOP, "id-ID")
        .meta,
    ).toBe("Google Drive · Menyinkronkan… 40 dari 95 folder");
  });

  it("AC-GAL-013 says when a removed folder was released and how many photos are hidden", () => {
    const removed = { ...SOURCE, removed: true, removedAt: "2026-10-04T04:02:00Z" };
    expect(sourceRowText(removed, null, null, DESKTOP, "id-ID")).toMatchObject({
      meta: "Dilepas Min, 4 Okt 2026 · 8 foto disembunyikan dari klien",
      chip: { label: "Dilepas" },
    });
  });

  it("AC-GAL-022 AC-GAL-024 a read-only gallery shows Terakhir disinkronkan, archived adds Arsip", () => {
    const readOnly = { ...DESKTOP, isReadOnly: true };
    expect(sourceRowText(SOURCE, null, null, readOnly, "id-ID")).toMatchObject({
      meta: "Google Drive · Terakhir disinkronkan Min, 4 Okt 2026 · 11.02",
      chip: { label: "Berhasil" },
    });
    expect(
      sourceRowText(SOURCE, null, null, { ...readOnly, isArchived: true }, "id-ID").chip.label,
    ).toBe("Arsip");
    expect(sourceRowText(SOURCE, null, null, { ...readOnly, isMobile: true }, "id-ID").meta).toBe(
      "Terakhir 4 Okt 2026 · 11.02",
    );
  });
});
