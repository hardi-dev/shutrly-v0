import { describe, expect, it } from "vitest";

import { sourceRowText } from "./source-text";

const SOURCE = {
  id: "s-1",
  name: "Rina-Wisuda",
  workspaceSourceName: "Google Drive",
  removed: false,
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

describe("sourceRowText", () => {
  it("AC-GAL-005 shows Berhasil, the sync time and the counts", () => {
    expect(sourceRowText(SOURCE, null, false)).toEqual({
      title: "Rina-Wisuda",
      meta: "Google Drive · Disinkronkan Min, 4 Okt 2026 · 11.02 · 4 proof · 3 edited · 1 print · 2 diabaikan",
      metaTone: "default",
      chip: { tone: "success", label: "Berhasil", hasDot: true },
    });
  });

  it("AC-GAL-007 AC-GAL-030 adds the missing and too-deep counts", () => {
    const text = sourceRowText(
      { ...SOURCE, missingCount: 1, ignoredCount: 0, tooDeepCount: 1 },
      null,
      false,
    );
    expect(text.meta).toContain("4 proof · 1 hilang · 3 edited · 1 print · 1 folder terlalu dalam");
  });

  it("AC-GAL-008 shows Gagal with the sharing hint in danger", () => {
    const text = sourceRowText(
      { ...SOURCE, syncStatus: "FAILED", syncErrorCode: "NOT_PUBLIC" },
      null,
      false,
    );
    expect(text.chip).toMatchObject({ tone: "danger", label: "Gagal" });
    expect(text.metaTone).toBe("danger");
    expect(text.meta).toContain("Siapa saja yang memiliki link");
  });

  it("D-9 shows the running and queued phases", () => {
    expect(sourceRowText(SOURCE, "SYNCING", false)).toMatchObject({
      meta: "Google Drive · Menyinkronkan…",
      chip: { tone: "info", label: "Menyinkronkan" },
    });
    expect(sourceRowText(SOURCE, "QUEUED", false).meta).toBe("Google Drive · Menunggu giliran…");
  });

  it("AC-GAL-013 AC-GAL-022 marks removed and archived sources", () => {
    expect(sourceRowText({ ...SOURCE, removed: true }, null, false).chip.label).toBe("Dilepas");
    expect(sourceRowText(SOURCE, null, true)).toMatchObject({
      meta: "Google Drive · Terakhir disinkronkan Min, 4 Okt 2026 · 11.02",
      chip: { label: "Arsip" },
    });
  });
});
