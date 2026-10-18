import { expect, type Page, test } from "@playwright/test";

import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { CLIENT_COPY } from "@/features/gallery/ui/client-copy/client-copy.copy";
import { CLIENT_HOME_COPY } from "@/features/gallery/ui/client-home-screen/client-home-screen.copy";
import { CLIENT_PASSWORD_FORM_COPY } from "@/features/gallery/ui/client-password-form/client-password-form.copy";
import { PICK_COPY } from "@/features/gallery/ui/pick-screen/pick-screen.copy";

import { uniqueEmail } from "../auth/auth-e2e";
import { FOLDER_URL, GALLERY_PASSWORD, linkedGallery } from "../client-access/client-access-e2e";
import { createProject, openGalleryWorkspace } from "../gallery/gallery-e2e";

// I8.2 journeys (AC-L10N-011). Each journey signs in or registers in Indonesian and checks that the
// Indonesian copy shows while the English copy of the same string does not.

test.setTimeout(420_000);
// The shared register and verify helpers wait 5 s by default, which a cold dev server can miss (as journeys.spec).
test.describe.configure({ retries: 2 });

const COLD_STEP = 45_000;

interface Pair {
  en: string;
  id: string;
}

/** The Indonesian text is visible on the page and its English twin is not. */
async function expectIndonesianOnly(page: Page, pair: Pair): Promise<void> {
  await expect(
    page.getByText(pair.id, { exact: true }).filter({ visible: true }).first(),
  ).toBeVisible({ timeout: COLD_STEP });
  await expect(page.getByText(pair.en, { exact: true }).filter({ visible: true })).toHaveCount(0);
}

const ownerNewTitle: Pair = {
  en: PROJECT_COPY.messages.en.createTitle,
  id: PROJECT_COPY.messages.id.createTitle,
};
const ownerCreate: Pair = {
  en: PROJECT_COPY.messages.en.create,
  id: PROJECT_COPY.messages.id.create,
};
const ownerListTitle: Pair = {
  en: PROJECT_COPY.messages.en.listTitle,
  id: PROJECT_COPY.messages.id.listTitle,
};

test("AC-L10N-011 an owner creates a project in Indonesian and sees only Indonesian", async ({
  page,
}) => {
  const workspaceId = await openGalleryWorkspace(page, uniqueEmail("journey-owner"));
  await expect(page.locator("html")).toHaveAttribute("lang", "id");

  await page.goto(`/w/${workspaceId}/projects/new`);
  await expect(page.locator("html")).toHaveAttribute("lang", "id", { timeout: COLD_STEP });
  await expectIndonesianOnly(page, ownerNewTitle);
  await expectIndonesianOnly(page, ownerCreate);

  await createProject(page, workspaceId, "BOOKED");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");

  await page.goto(`/w/${workspaceId}/projects`);
  await expect(page.locator("html")).toHaveAttribute("lang", "id", { timeout: COLD_STEP });
  await expectIndonesianOnly(page, ownerListTitle);
});

const clientHomeStart: Pair = {
  en: CLIENT_HOME_COPY.messages.en.actionStart,
  id: CLIENT_HOME_COPY.messages.id.actionStart,
};
const clientReview: Pair = { en: PICK_COPY.messages.en.review, id: PICK_COPY.messages.id.review };
const clientOpen: Pair = {
  en: CLIENT_COPY.messages.en.groupStatusOpen,
  id: CLIENT_COPY.messages.id.groupStatusOpen,
};

/** Signs the client in with the fixture password; the password screen is Indonesian for an Indonesian owner. */
async function signInClient(client: Page, clientPath: string): Promise<void> {
  const field = client.locator('input[name="password"]');
  // The sync can finish a moment before the client route reads the gallery, so retry the first load.
  await expect(async () => {
    await client.goto(clientPath);
    await expect(field).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  await field.fill(GALLERY_PASSWORD);
  await client.getByRole("button", { name: CLIENT_PASSWORD_FORM_COPY.messages.id.submit }).click();
  await expect(client).toHaveURL(clientPath, { timeout: COLD_STEP });
}

/** Picks the first proof on the open Pilih screen and checks that it turned pressed. */
async function pickFirstProof(client: Page): Promise<void> {
  const proof = client.getByRole("button", { pressed: false }).first();
  const name = (await proof.getAttribute("aria-label")) ?? (await proof.innerText()).trim();
  await proof.click();
  await expect(client.getByRole("button", { name, pressed: true }).first()).toBeVisible({
    timeout: COLD_STEP,
  });
}

test.describe("client journey", () => {
  // Needs a real public folder: the journey is skipped without GALLERY_SMOKE_FOLDER_URL.
  test.skip(!FOLDER_URL, "GALLERY_SMOKE_FOLDER_URL is unset");

  test("AC-L10N-011 a client picks and submits in Indonesian", async ({ page, browser }) => {
    // The client picks, so the project needs a selection item (the e2e package has none).
    const { clientPath } = await linkedGallery(page, FOLDER_URL, { withPickItem: true });
    const context = await browser.newContext();
    const client = await context.newPage();
    try {
      await signInClient(client, clientPath);
      await expect(client.locator("html")).toHaveAttribute("lang", "id");
      await expectIndonesianOnly(client, clientHomeStart);

      await client.getByRole("link", { name: clientHomeStart.id }).first().click();
      await pickFirstProof(client);
      await expectIndonesianOnly(client, clientReview);

      await client.getByRole("link", { name: clientReview.id }).first().click();
      await client
        .getByRole("button", { name: /^Kirim/ })
        .filter({ visible: true })
        .first()
        .click();
      const confirm = client.getByRole("dialog").filter({ visible: true });
      await confirm.getByRole("button", { name: /^Kirim/ }).click();
      await expect(client).toHaveURL(/\/g\/[^/]+$/, { timeout: COLD_STEP });
      await expectIndonesianOnly(client, clientOpen);
    } finally {
      await context.close();
    }
  });
});
