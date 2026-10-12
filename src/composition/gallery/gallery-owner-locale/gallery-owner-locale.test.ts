import { beforeEach, describe, expect, it, vi } from "vitest";

const withRequestDb = vi.hoisted(() => vi.fn());

vi.mock("../../request-db/request-db", () => ({ withRequestDb }));

import { loadGalleryOwnerLocale } from "./gallery-owner-locale";

describe("loadGalleryOwnerLocale", () => {
  beforeEach(() => {
    withRequestDb.mockReset();
  });

  it("C-104 a malformed token never reaches the database", async () => {
    expect(await loadGalleryOwnerLocale("not-a-token")).toBeNull();
    expect(withRequestDb).not.toHaveBeenCalled();
  });
});
