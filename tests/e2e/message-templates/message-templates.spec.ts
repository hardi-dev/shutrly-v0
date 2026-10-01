import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { TEMPLATE_COPY } from "@/features/communications/ui/template-copy/template-copy.copy";
import { TEMPLATE_EDITOR_COPY } from "@/features/communications/ui/template-editor-screen/template-editor-screen.copy";
import { UNSAVED_CHANGES_COPY } from "@/features/communications/ui/unsaved-changes-dialog/unsaved-changes-dialog.copy";
import { COMING_SOON_COPY } from "@/features/workspace/ui/coming-soon-screen/coming-soon-screen.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { OWNER_NAV_COPY } from "@/features/workspace/ui/owner-nav/owner-nav.copy";
import { WORKSPACE_NOT_FOUND_COPY } from "@/features/workspace/ui/workspace-not-found-screen/workspace-not-found-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

test.setTimeout(120_000);
test.describe.configure({ retries: 2 });

async function openWorkspace(page: Page, label: string): Promise<string> {
  await page.setViewportSize(DESKTOP);
  await registerAndVerify(page, uniqueEmail(label));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Aster Wedding");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  const url = new URL(page.url());
  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
}

test("AC-MSG-001 AC-MSG-004 AC-MSG-005 AC-MSG-006 AC-MSG-007 AC-MSG-009 AC-MSG-013 AC-MSG-014 edit a template", async ({
  page,
}) => {
  const home = await openWorkspace(page, "templates");
  await page.getByRole("link", { name: OWNER_NAV_COPY.messageTemplates }).click();
  await expect(page).toHaveURL(`${home}/message-templates`);
  await expect(page.getByText(COMING_SOON_COPY.title)).toHaveCount(0);
  await expect(page.getByRole("link", { name: OWNER_NAV_COPY.messageTemplates })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const rows = page.getByRole("main").getByRole("link");
  await expect(rows).toHaveCount(5);

  await page.getByRole("link", { name: new RegExp(TEMPLATE_COPY.GALLERY_SHARE.label) }).click();
  await expect(page).toHaveURL(`${home}/message-templates/gallery-share`);
  const editor = page.getByRole("textbox", { name: TEMPLATE_EDITOR_COPY.contentLabel });
  await expect(editor).toContainText("{{galleryUrl}}");
  await expect(page.getByRole("region", { name: "Pratinjau pesan" })).toContainText("••••••");

  await editor.press("ControlOrMeta+End");
  await editor.pressSequentially("\nInvoice: {{invoiceUrl}}");
  await page.getByRole("button", { name: TEMPLATE_EDITOR_COPY.save }).click();
  await expect(page.getByText(/tidak bisa dipakai di Bagikan gallery/)).toBeVisible();

  await page.getByRole("button", { name: TEMPLATE_EDITOR_COPY.restore }).click();
  await page.getByRole("button", { name: "Sisipkan {{projectTitle}}" }).click();
  await page.getByRole("link", { name: OWNER_NAV_COPY.settings }).click();
  await expect(page.getByRole("alertdialog", { name: UNSAVED_CHANGES_COPY.title })).toBeVisible();
  await page.getByRole("button", { name: UNSAVED_CHANGES_COPY.stay }).click();
  await expect(page).toHaveURL(`${home}/message-templates/gallery-share`);

  await page.getByRole("button", { name: TEMPLATE_EDITOR_COPY.save }).click();
  await expect(page.getByText(TEMPLATE_EDITOR_COPY.saved)).toBeVisible();
  await page.reload();
  await expect(editor).toContainText("{{projectTitle}}");
});

test("AC-MSG-020 list and editor are accessible on desktop and phone", async ({ page }) => {
  const home = await openWorkspace(page, "templates-a11y");
  for (const path of ["/message-templates", "/message-templates/payment-reminder"]) {
    await page.goto(`${home}${path}`);
    for (const viewport of [DESKTOP, PHONE]) {
      await page.setViewportSize(viewport);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  }
  await page.setViewportSize(PHONE);
  await expect(page.getByRole("link", { name: "Kembali" })).toHaveAttribute(
    "href",
    new URL(`${home}/message-templates`).pathname,
  );
});

test("AC-MSG-015 another owner's template editor is not found", async ({ browser, page }) => {
  const home = await openWorkspace(page, "templates-owner-a");
  const other = await browser.newPage();
  await openWorkspace(other, "templates-owner-b");
  await other.goto(`${home}/message-templates/gallery-share`);
  await expect(other.getByRole("heading", { name: WORKSPACE_NOT_FOUND_COPY.title })).toBeVisible();
  await other.close();
});
