import {
  projectContext,
  projectFixture,
  validCreateInput,
} from "@tests/support/booking/project-fixtures";
import { fakeCipher, fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { FakeGalleryRepository } from "@tests/support/gallery/fake-gallery-repository";
import { describe, expect, it } from "vitest";

import type { PreparedGalleryPassword } from "@/features/gallery/application/use-cases/create-gallery-for-booking/create-gallery-for-booking.types";

import { confirmBookingWithGallery, createProjectWithGallery } from "./booking-gallery-flows";
import type { BookingGalleryScope } from "./booking-gallery-scope.types";

const locale = "id-ID";

async function preparedFor(galleryId: string): Promise<PreparedGalleryPassword> {
  const password = await fakeCipher.encrypt("mawar-4821", {
    workspaceId: projectContext.workspaceId,
    galleryId,
  });
  return { galleryId, password, passwordHash: await fakeHasher.hash("mawar-4821") };
}

function scopeWith(projects: ReturnType<typeof projectFixture>, galleries: FakeGalleryRepository) {
  const scope: BookingGalleryScope = {
    projects,
    accessTokens: () => "token-1",
    galleries,
  };
  return scope;
}

describe("booking creates its gallery in the same work", () => {
  it("AC-GFL-001 a BOOKED project is saved with exactly one gallery and its selection groups", async () => {
    const projects = projectFixture();
    const galleries = new FakeGalleryRepository();
    // The fake project repository numbers its rows from one, so the gallery can be registered first.
    const projectId = `project-${String(projects.projects.length + 1)}`;
    galleries.addProject({
      id: projectId,
      workspaceId: projectContext.workspaceId,
      status: "BOOKED",
      title: "Wisuda Basic — Rina",
      clientName: "Rina",
    });
    const result = await createProjectWithGallery(
      scopeWith(projects, galleries),
      projectContext,
      "owner",
      validCreateInput(),
      locale,
      await preparedFor("gallery-1"),
    );
    expect(result).toEqual({ ok: true, projectId });
    expect(galleries.galleries).toHaveLength(1);
    expect(galleries.galleries[0]).toMatchObject({ id: "gallery-1", expiresAt: null });
    expect(galleries.selectionGroups).toEqual(["gallery-1"]);
  });

  it("AC-GFL-001 a DRAFT project is saved without a gallery", async () => {
    const projects = projectFixture();
    const galleries = new FakeGalleryRepository();
    const result = await createProjectWithGallery(
      scopeWith(projects, galleries),
      projectContext,
      "owner",
      validCreateInput({ mode: "DRAFT", sessions: [] }),
      locale,
      null,
    );
    expect(result.ok).toBe(true);
    expect(galleries.galleries).toHaveLength(0);
  });

  it("AC-GFL-003 a gallery that cannot be created rejects the whole booking", async () => {
    const projects = projectFixture();
    const galleries = new FakeGalleryRepository();
    await expect(
      createProjectWithGallery(
        scopeWith(projects, galleries),
        projectContext,
        "owner",
        validCreateInput(),
        locale,
        await preparedFor("gallery-1"),
      ),
    ).rejects.toThrow();
  });

  it("AC-GFL-002 confirming a DRAFT creates its gallery and selection groups", async () => {
    const projects = projectFixture();
    const galleries = new FakeGalleryRepository();
    const created = await createProjectWithGallery(
      scopeWith(projects, galleries),
      projectContext,
      "owner",
      validCreateInput({ mode: "DRAFT" }),
      locale,
      null,
    );
    if (!created.ok || !("projectId" in created)) throw new Error("draft not created");
    galleries.addProject({
      id: created.projectId,
      workspaceId: projectContext.workspaceId,
      status: "BOOKED",
      title: "Wisuda Basic — Rina",
      clientName: "Rina",
    });
    const result = await confirmBookingWithGallery(
      scopeWith(projects, galleries),
      projectContext,
      "owner",
      created.projectId,
      await preparedFor("gallery-2"),
    );
    expect(result).toBeUndefined();
    expect(galleries.galleries.map((row) => row.id)).toEqual(["gallery-2"]);
    expect(galleries.selectionGroups).toEqual(["gallery-2"]);
  });

  it("AC-GFL-002 a draft without a session is refused and creates no gallery", async () => {
    const projects = projectFixture();
    const galleries = new FakeGalleryRepository();
    const created = await createProjectWithGallery(
      scopeWith(projects, galleries),
      projectContext,
      "owner",
      validCreateInput({ mode: "DRAFT", sessions: [] }),
      locale,
      null,
    );
    if (!created.ok || !("projectId" in created)) throw new Error("draft not created");
    galleries.addProject({
      id: created.projectId,
      workspaceId: projectContext.workspaceId,
      status: "DRAFT",
      title: "Wisuda Basic — Rina",
      clientName: "Rina",
    });
    const result = await confirmBookingWithGallery(
      scopeWith(projects, galleries),
      projectContext,
      "owner",
      created.projectId,
      await preparedFor("gallery-3"),
    );
    expect(result).toEqual({ ok: false, code: "SESSION_REQUIRED" });
    expect(galleries.galleries).toHaveLength(0);
  });
});
