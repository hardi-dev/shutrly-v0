import { describe, expect, it } from "vitest";

import { GALLERY_COPY } from "./gallery-copy.copy";

// A folder name written as code, e.g. `edited`: no guidance may present one as special (AC-SFX-015).
const FOLDER_NAME = /`(edited|print)`/i;

// Open item (F-24, not resolved): the Edited and Print tab lines still read `visibilityFoldedEdited`
// and `visibilityFoldedPrint` in browse-text.kindVisibility, and no approved replacement exists. They
// are the only exception until the Owner approves wording; no other message may name a folder.
const OPEN_FOLDED_KEYS: readonly string[] = ["visibilityFoldedEdited", "visibilityFoldedPrint"];

describe("gallery copy: folder guidance (F-24 D5, AC-SFX-015)", () => {
  it("shows the approved empty-state body in English", () => {
    expect(GALLERY_COPY.messages.en.sourcesEmptyBody).toBe(
      "Link a project folder. Photos are for selection unless you map a subfolder to a package item; files in mapped subfolders are final files.",
    );
  });

  it("shows the approved empty-state body in Indonesian", () => {
    expect(GALLERY_COPY.messages.id.sourcesEmptyBody).toBe(
      "Tautkan folder proyek. Foto digunakan untuk pilihan kecuali subfolder dipetakan ke item paket; file di subfolder yang dipetakan menjadi hasil akhir.",
    );
  });

  it("shows the approved add-folder description in both locales", () => {
    expect(GALLERY_COPY.messages.en.linkDialogDescription).toBe(
      "Photos stay available for selection unless their subfolder is mapped to a package item. Mapped files are final files.",
    );
    expect(GALLERY_COPY.messages.id.linkDialogDescription).toBe(
      "Foto tetap tersedia untuk dipilih kecuali subfoldernya dipetakan ke item paket. File yang dipetakan menjadi hasil akhir.",
    );
  });

  it("names no folder as special, apart from the open folded-tab keys", () => {
    for (const messages of [GALLERY_COPY.messages.en, GALLERY_COPY.messages.id]) {
      for (const [key, value] of Object.entries(messages)) {
        if (OPEN_FOLDED_KEYS.includes(key)) continue;
        expect(value, key).not.toMatch(FOLDER_NAME);
      }
    }
  });
});
