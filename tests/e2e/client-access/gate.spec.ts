import { expect, type Page, test } from "@playwright/test";

import { CLIENT_BROWSE_COPY } from "@/features/gallery/ui/client-browse-screen/client-browse-screen.copy";
import { CLIENT_GATE_SCREEN_COPY } from "@/features/gallery/ui/client-gate-screen/client-gate-screen.copy";
import { CLIENT_PASSWORD_FORM_COPY } from "@/features/gallery/ui/client-password-form/client-password-form.copy";
import { CLIENT_UNAVAILABLE_COPY } from "@/features/gallery/ui/client-unavailable/client-unavailable.copy";

import { expectGalleryA11y } from "../gallery/gallery-e2e";
import { FOLDER_URL, GALLERY_PASSWORD, publishedGallery } from "./client-access-e2e";

// Needs the dev server without E2E_FAKE_DRIVE and the real public folder from .env.test.
test.skip(!FOLDER_URL, "GALLERY_SMOKE_FOLDER_URL is not set");
test.setTimeout(300_000);

async function enterPassword(page: Page, password: string): Promise<void> {
  await page.getByLabel(CLIENT_PASSWORD_FORM_COPY.password).fill(password);
  await page.getByRole("button", { name: CLIENT_PASSWORD_FORM_COPY.submit }).click();
}

test("AC-ACC-001 AC-ACC-002 AC-ACC-004 AC-ACC-007 AC-ACC-012 the client gate end to end", async ({
  page,
  browser,
}) => {
  const { clientPath } = await publishedGallery(page);

  // AC-ACC-007: the signed-in Owner still gets the password screen.
  await page.goto(clientPath);
  await expect(page.getByRole("heading", { name: CLIENT_GATE_SCREEN_COPY.title })).toBeVisible();

  const client = await browser.newContext();
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const visitor = await client.newPage();
    const response = await visitor.goto(clientPath);
    expect(response?.headers()["cache-control"]).toBe("private, no-store");
    await expectGalleryA11y(visitor);

    await enterPassword(visitor, "mawar-0000");
    await expect(visitor.getByText(CLIENT_PASSWORD_FORM_COPY.wrongPassword)).toBeVisible();
    await expectGalleryA11y(visitor);

    // A-31: the default service has no selection item, so the client lands on Semua foto.
    await enterPassword(visitor, GALLERY_PASSWORD);
    await expect(visitor).toHaveURL(`${clientPath}/foto`);
    await visitor.reload();
    await expect(visitor).toHaveURL(`${clientPath}/foto`);
    await expect(
      visitor.getByText(CLIENT_BROWSE_COPY.cardTitle, { exact: true }).first(),
    ).toBeVisible();
    const cookie = (await client.cookies()).find((item) => item.name === "shutrly_gallery");
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, path: clientPath });

    // AC-ACC-004: an unknown link answers 404 with the neutral page only.
    const unknown = await visitor.goto(`/g/${"x".repeat(43)}`);
    expect(unknown?.status()).toBe(404);
    await expect(visitor.getByText(CLIENT_UNAVAILABLE_COPY.title)).toBeVisible();
    await expectGalleryA11y(visitor);

    const mobile = await phone.newPage();
    await mobile.goto(clientPath);
    await expect(
      mobile.getByRole("heading", { name: CLIENT_GATE_SCREEN_COPY.title }),
    ).toBeVisible();
    await expectGalleryA11y(mobile);
  } finally {
    await client.close();
    await phone.close();
  }
});
