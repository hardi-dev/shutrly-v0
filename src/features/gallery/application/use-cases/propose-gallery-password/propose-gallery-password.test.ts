import { fixedRandom } from "@tests/support/gallery/fake-gallery-crypto";
import {
  BOOKED_PROJECT_ID,
  fixtureGalleries,
  OTHER_WORKSPACE,
  WORKSPACE,
} from "@tests/support/gallery/gallery-fixtures";
import { describe, expect, it } from "vitest";

import { proposeGalleryPassword } from "./propose-gallery-password";

describe("proposeGalleryPassword", () => {
  it("AC-GAL-001 proposes <word>-<4 digits> and a new one on each call", async () => {
    const galleries = fixtureGalleries();
    const random = fixedRandom(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    const first = await proposeGalleryPassword(galleries, random, WORKSPACE, BOOKED_PROJECT_ID);
    const second = await proposeGalleryPassword(galleries, random, WORKSPACE, BOOKED_PROJECT_ID);
    expect(first).toMatch(/^[a-z]{4,8}-[2-9]{4}$/);
    expect(second).not.toBe(first);
  });

  it("A-11 never proposes a word of the client's name", async () => {
    const galleries = fixtureGalleries();
    galleries.projects[0] = { ...galleries.projects[0], clientName: "Mawar" };
    const proposal = await proposeGalleryPassword(
      galleries,
      fixedRandom(0),
      WORKSPACE,
      BOOKED_PROJECT_ID,
    );
    expect(proposal.startsWith("mawar-")).toBe(false);
  });

  it("AC-GAL-025 treats another workspace's project as not found", async () => {
    await expect(
      proposeGalleryPassword(
        fixtureGalleries(),
        fixedRandom(0),
        OTHER_WORKSPACE,
        BOOKED_PROJECT_ID,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
