import { OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { setGalleryExpiry } from "./set-gallery-expiry";

describe("setGalleryExpiry", () => {
  it("AC-GAL-018 counts days from now on a published gallery", async () => {
    const { deps, sources } = await lifecycleSetup({ status: "PUBLISHED" });
    const result = await setGalleryExpiry(deps, WORKSPACE, OWNER_ID, GALLERY_ID, {
      expiry: { type: "DAYS", days: 7 },
    });
    expect(result).toEqual({ ok: true, reopened: false });
    expect(sources.galleries.get(GALLERY_ID)?.expiresAt).toEqual(new Date("2026-10-11T03:00:00Z"));
  });

  it("AC-GAL-020 re-opens an expired gallery with a later or no expiry", async () => {
    const past = new Date("2026-10-01T00:00:00Z");
    const { deps, sources } = await lifecycleSetup({ status: "PUBLISHED", expiresAt: past });
    expect(
      await setGalleryExpiry(deps, WORKSPACE, OWNER_ID, GALLERY_ID, { expiry: { type: "NONE" } }),
    ).toEqual({ ok: true, reopened: true });
    expect(sources.galleries.get(GALLERY_ID)).toMatchObject({
      status: "PUBLISHED",
      expiresAt: null,
    });
  });

  it("AC-GAL-019 refuses a past date and AC-GAL-022 an archived gallery", async () => {
    const draft = await lifecycleSetup();
    expect(
      await setGalleryExpiry(draft.deps, WORKSPACE, OWNER_ID, GALLERY_ID, {
        expiry: { type: "DATE", date: "2026-10-01" },
      }),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { "expiry.date": "PAST_DATE" },
    });
    const archived = await lifecycleSetup({ status: "ARCHIVED" });
    expect(
      await setGalleryExpiry(archived.deps, WORKSPACE, OWNER_ID, GALLERY_ID, {
        expiry: { type: "NONE" },
      }),
    ).toEqual({ ok: false, code: "INVALID_STATE" });
  });
});
