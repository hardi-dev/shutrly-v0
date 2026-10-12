import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { PAGE_NOT_FOUND_COPY } from "@/features/workspace/ui/page-not-found-screen/page-not-found-screen.copy";
import { WORKSPACE_NOT_FOUND_COPY } from "@/features/workspace/ui/workspace-not-found-screen/workspace-not-found-screen.copy";
import { PAGE_HEADER_COPY_NAMESPACE } from "@/ui/patterns/page-header/page-header.copy";

import { addClient, addService, createBookedProject, openWorkspace } from "../team/team-e2e";

// Owners register in Indonesian by default, so the expected text is the ID copy.
const notFound = PAGE_NOT_FOUND_COPY.messages.id;
const workspaceNotFound = WORKSPACE_NOT_FOUND_COPY.messages.id;
const breadcrumbLabel = copyTranslator(PAGE_HEADER_COPY_NAMESPACE, "id")("breadcrumb");

test.setTimeout(420_000);
// The shared owner helpers wait 5 s for the redirect after sign-up, which a cold dev server can miss
// (the same retries as the team and catalog specs).
test.describe.configure({ retries: 2 });

/** Opens a path that must show the page-not-found state inside the shell (AC-SFX-011, AC-SFX-014). */
async function expectPageNotFound(page: Page, path: string, hidden: readonly string[]) {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: notFound.title })).toBeVisible({
    timeout: 90_000,
  });
  await expect(page.getByText(workspaceNotFound.title)).toHaveCount(0);
  const crumbs = await page.getByRole("navigation", { name: breadcrumbLabel }).allInnerTexts();
  for (const crumb of crumbs) {
    for (const text of hidden) expect(crumb).not.toContain(text);
  }
}

test("a missing page or unknown section stays inside the workspace (AC-SFX-011, AC-SFX-013, AC-SFX-014)", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page);
  const missingProject = crypto.randomUUID();
  const missingService = crypto.randomUUID();
  await expectPageNotFound(page, `/w/${workspaceId}/message-templates/no-such-template`, [
    "no-such-template",
  ]);
  await expectPageNotFound(page, `/w/${workspaceId}/projects/${missingProject}`, [missingProject]);
  await expectPageNotFound(page, `/w/${workspaceId}/services/${missingService}`, [missingService]);
  await expectPageNotFound(page, `/w/${workspaceId}/no-such-section`, ["no-such-section"]);

  await page.goto(`/w/${crypto.randomUUID()}/projects`);
  await expect(page.getByRole("heading", { name: workspaceNotFound.title })).toBeVisible({
    timeout: 90_000,
  });
});

test("another owner's project and service look missing (AC-SFX-012, AC-SFX-014)", async ({
  page,
  browser,
}) => {
  const workspaceA = await openWorkspace(page);
  await addClient(page, workspaceA);
  await addService(page, workspaceA);
  const serviceId = new URL(page.url()).pathname.split("/")[4];
  await createBookedProject(page, workspaceA);
  const projectId = new URL(page.url()).pathname.split("/")[4];

  const otherPage = await (await browser.newContext()).newPage();
  const workspaceB = await openWorkspace(otherPage);
  const ownerAData = [projectId, serviceId, "Rina", "Wisuda Basic"];
  await expectPageNotFound(otherPage, `/w/${workspaceB}/projects/${projectId}`, ownerAData);
  await expectPageNotFound(otherPage, `/w/${workspaceB}/services/${serviceId}`, ownerAData);
  const body = await otherPage.innerText("body");
  for (const text of ["Rina", "Wisuda Basic"]) expect(body).not.toContain(text);
});
