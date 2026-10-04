import { FakeGalleryRepository } from "@tests/support/gallery/fake-gallery-repository";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

export const WORKSPACE = { workspaceId: asWorkspaceId("11111111-1111-4111-8111-111111111111") };
export const OTHER_WORKSPACE = {
  workspaceId: asWorkspaceId("22222222-2222-4222-8222-222222222222"),
};
export const OWNER_ID = "owner-1";
export const BOOKED_PROJECT_ID = "33333333-3333-4333-8333-333333333333";
export const DRAFT_PROJECT_ID = "44444444-4444-4444-8444-444444444444";
export const CANCELLED_PROJECT_ID = "55555555-5555-4555-8555-555555555555";

/** A gallery repository holding the AC fixture projects: *Wisuda Rina* (BOOKED), *Wisuda Sari* (DRAFT) and a cancelled one. */
export function fixtureGalleries(): FakeGalleryRepository {
  const repository = new FakeGalleryRepository();
  const base = { workspaceId: WORKSPACE.workspaceId, clientName: "Rina Saputri" };
  repository.addProject({ ...base, id: BOOKED_PROJECT_ID, status: "BOOKED", title: "Wisuda Rina" });
  repository.addProject({ ...base, id: DRAFT_PROJECT_ID, status: "DRAFT", title: "Wisuda Sari" });
  repository.addProject({
    ...base,
    id: CANCELLED_PROJECT_ID,
    status: "CANCELLED",
    title: "Wisuda Batal",
  });
  return repository;
}
