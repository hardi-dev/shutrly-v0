import { describe, expect, it } from "vitest";

import { parseDriveFolderLink } from "./drive-folder-link";

const ID = "1AbCdEfGhIjKlMnOpQrStUv";

describe("parseDriveFolderLink", () => {
  it("AC-GAL-005 reads a folder link with or without a resource key", () => {
    expect(
      parseDriveFolderLink(`https://drive.google.com/drive/folders/${ID}?usp=sharing`),
    ).toEqual({
      ok: true,
      folderId: ID,
      resourceKey: null,
    });
    expect(
      parseDriveFolderLink(`https://drive.google.com/drive/u/1/folders/${ID}?resourcekey=0-abc`),
    ).toEqual({ ok: true, folderId: ID, resourceKey: "0-abc" });
    expect(parseDriveFolderLink(` https://drive.google.com/open?id=${ID} `)).toMatchObject({
      ok: true,
      folderId: ID,
    });
  });

  it("AC-GAL-009 refuses a Drive file link as not a folder", () => {
    expect(parseDriveFolderLink(`https://drive.google.com/file/d/${ID}/view`)).toEqual({
      ok: false,
      code: "NOT_A_FOLDER",
    });
  });

  it("AC-GAL-009 refuses a link that isn't Google Drive", () => {
    expect(parseDriveFolderLink("https://example.com")).toEqual({ ok: false, code: "NOT_DRIVE" });
    expect(parseDriveFolderLink("bukan link")).toEqual({ ok: false, code: "NOT_DRIVE" });
    expect(parseDriveFolderLink(`http://drive.google.com/drive/folders/${ID}`)).toEqual({
      ok: false,
      code: "NOT_DRIVE",
    });
  });
});
