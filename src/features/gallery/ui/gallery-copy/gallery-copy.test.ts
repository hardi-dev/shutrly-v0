import { describe, expect, it } from "vitest";

import { GALLERY_COPY } from "./gallery-copy.copy";

// A folder name written as code, e.g. `edited`: no guidance may present one as special (AC-SFX-015).
const FOLDER_NAME = /`(edited|print)`/i;

// Folder names as plain words too: no message may name an edited or print folder (AC-SFX-015).
const FOLDER_WORD = /\b(edited|print)\b folders?/i;

describe("gallery copy: folder guidance (F-24 D5, AC-SFX-015)", () => {
  it("shows the approved Edited and Print tab explanations in both locales", () => {
    expect(GALLERY_COPY.messages.en.visibilityFoldedEdited).toBe(
      "Hidden until final delivery is published. Files come from subfolders mapped to an edited-photo package item.",
    );
    expect(GALLERY_COPY.messages.id.visibilityFoldedEdited).toBe(
      "Disembunyikan sampai hasil akhir dipublikasikan. File berasal dari subfolder yang dipetakan ke item paket Hasil edit.",
    );
    expect(GALLERY_COPY.messages.en.visibilityFoldedPrint).toBe(
      "Hidden until final delivery is published. Files come from subfolders mapped to a printed-photo package item.",
    );
    expect(GALLERY_COPY.messages.id.visibilityFoldedPrint).toBe(
      "Disembunyikan sampai hasil akhir dipublikasikan. File berasal dari subfolder yang dipetakan ke item paket Foto cetak.",
    );
  });

  it("shows the Owner-approved empty-state body in English (AC-GFL-007, copy draft iteration 5)", () => {
    expect(GALLERY_COPY.messages.en.sourcesEmptyBody).toBe(
      "No folder yet. Add a Google Drive folder with this project’s photos; then you can send the gallery link to the client.",
    );
  });

  it("shows the Owner-approved empty-state body in Indonesian (AC-GFL-007, copy draft iteration 5)", () => {
    expect(GALLERY_COPY.messages.id.sourcesEmptyBody).toBe(
      "Belum ada folder. Tambahkan folder Google Drive berisi foto proyek ini; setelah itu kamu bisa mengirim link galeri ke klien.",
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

  it("names no edited or print folder in any message", () => {
    for (const messages of [GALLERY_COPY.messages.en, GALLERY_COPY.messages.id]) {
      for (const [key, value] of Object.entries(messages)) {
        expect(value, key).not.toMatch(FOLDER_NAME);
        expect(value, key).not.toMatch(FOLDER_WORD);
      }
    }
  });
});
