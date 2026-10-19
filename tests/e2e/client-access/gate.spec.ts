import { expect, type Page, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { CLIENT_BROWSE_COPY_NAMESPACE } from "@/features/gallery/ui/client-browse-screen/client-browse-screen.copy";
import { CLIENT_GATE_SCREEN_COPY_NAMESPACE } from "@/features/gallery/ui/client-gate-screen/client-gate-screen.copy";
import { CLIENT_PASSWORD_FORM_COPY_NAMESPACE } from "@/features/gallery/ui/client-password-form/client-password-form.copy";
import { CLIENT_UNAVAILABLE_COPY_NAMESPACE } from "@/features/gallery/ui/client-unavailable/client-unavailable.copy";

import { expectGalleryA11y } from "../gallery/gallery-e2e";
import { FOLDER_URL, GALLERY_PASSWORD, linkedGallery } from "./client-access-e2e";

const browseCopy = copyTranslator(CLIENT_BROWSE_COPY_NAMESPACE, "id");
const gateCopy = copyTranslator(CLIENT_GATE_SCREEN_COPY_NAMESPACE, "id");
const passwordCopy = copyTranslator(CLIENT_PASSWORD_FORM_COPY_NAMESPACE, "id");
// An unknown link has no owner, so its neutral page uses the default language (English).
const unavailableCopy = copyTranslator(CLIENT_UNAVAILABLE_COPY_NAMESPACE, "en");

// Needs the dev server without E2E_FAKE_DRIVE and the real public folder from .env.test.
test.skip(!FOLDER_URL, "GALLERY_SMOKE_FOLDER_URL is not set");
test.setTimeout(300_000);

async function enterPassword(page: Page, password: string): Promise<void> {
  await page.getByLabel(passwordCopy("password")).fill(password);
  await page.getByRole("button", { name: passwordCopy("submit") }).click();
}

test("AC-ACC-001 AC-ACC-002 AC-ACC-004 AC-ACC-007 AC-ACC-012 the client gate end to end", async ({
  page,
  browser,
}) => {
  const { clientPath } = await linkedGallery(page);

  // AC-ACC-007: the signed-in Owner still gets the password screen. The sync can finish a moment
  // before the client route reads the gallery, so retry the first load until it answers.
  await expect(async () => {
    await page.goto(clientPath);
    await expect(page.getByRole("heading", { name: gateCopy("title") })).toBeVisible({
      timeout: 2_000,
    });
  }).toPass({ timeout: 30_000 });

  const client = await browser.newContext();
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const visitor = await client.newPage();
    const response = await visitor.goto(clientPath);
    // `next dev` rewrites Cache-Control to "no-cache, must-revalidate" on every page, so the
    // production value "private, no-store" is pinned against next.config in the integration
    // test secrets-sweep (AC-ACC-012). Here: never publicly cacheable, never indexed.
    expect(response?.headers()["cache-control"]).not.toMatch(/public|s-maxage/);
    expect(response?.headers()["x-robots-tag"]).toBe("noindex");
    await expectGalleryA11y(visitor);

    await enterPassword(visitor, "mawar-0000");
    await expect(visitor.getByText(passwordCopy("wrongPassword"))).toBeVisible();
    await expectGalleryA11y(visitor);

    // F-23 R-7 (A-31 withdrawn): even without selection items the client lands on Beranda.
    await enterPassword(visitor, GALLERY_PASSWORD);
    await expect(visitor.getByRole("heading", { name: gateCopy("title") })).toBeHidden();
    await expect(visitor).toHaveURL(clientPath);
    // The session survives a reload: Beranda again, then *Semua foto* opens without the gate.
    await visitor.reload();
    await expect(visitor).toHaveURL(clientPath);
    await expect(visitor.getByRole("heading", { name: gateCopy("title") })).toBeHidden();
    await visitor.goto(`${clientPath}/photos`);
    await expect(visitor.getByText(browseCopy("cardTitle"), { exact: true }).first()).toBeVisible();
    const cookie = (await client.cookies()).find((item) => item.name === "shutrly_gallery");
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, path: clientPath });

    // AC-ACC-004: an unknown link answers 404 with the neutral page only.
    const unknown = await visitor.goto(`/g/${"x".repeat(43)}`);
    expect(unknown?.status()).toBe(404);
    await expect(visitor.getByText(unavailableCopy("title"))).toBeVisible();
    await expectGalleryA11y(visitor);

    const mobile = await phone.newPage();
    await mobile.goto(clientPath);
    await expect(mobile.getByRole("heading", { name: gateCopy("title") })).toBeVisible();
    await expectGalleryA11y(mobile);
  } finally {
    await client.close();
    await phone.close();
  }
});
