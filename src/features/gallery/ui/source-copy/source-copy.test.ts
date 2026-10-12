import { describe, expect, it } from "vitest";

import { SOURCE_COPY } from "./source-copy.copy";

// A folder name written as code, e.g. `edited`: the guide must not present one as special (AC-SFX-015).
const FOLDER_NAME = /`(edited|print)`/i;

describe("source copy: folder guidance (F-24 D5, AC-SFX-015)", () => {
  it("shows the approved mapping guidance in English", () => {
    expect(SOURCE_COPY.messages.en.guideStep3).toBe(
      "Later, map any subfolder to a package item on the gallery page. Files in mapped subfolders are final files; unmapped photos stay available for selection.",
    );
    expect(SOURCE_COPY.messages.en.treeEdited).toBe("Hasil Edit → mapped to Edited photos later");
    expect(SOURCE_COPY.messages.en.treePrint).toBe("Cetak → mapped to Printed photos later");
  });

  it("shows the approved mapping guidance in Indonesian", () => {
    expect(SOURCE_COPY.messages.id.guideStep3).toBe(
      "Nanti, petakan subfolder apa pun ke item paket di halaman galeri. File di subfolder yang dipetakan menjadi hasil akhir; foto yang belum dipetakan tetap tersedia untuk dipilih.",
    );
    expect(SOURCE_COPY.messages.id.treeEdited).toBe("Hasil Edit → dipetakan ke Hasil edit nanti");
    expect(SOURCE_COPY.messages.id.treePrint).toBe("Cetak → dipetakan ke Foto cetak nanti");
  });

  it("names no folder as special in either locale", () => {
    for (const messages of [SOURCE_COPY.messages.en, SOURCE_COPY.messages.id]) {
      for (const value of Object.values(messages)) {
        expect(value).not.toMatch(FOLDER_NAME);
      }
    }
  });
});
