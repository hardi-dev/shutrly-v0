import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { CREATE_WORKSPACE_COPY } from "@/features/workspace/ui/create-workspace-dialog/create-workspace-dialog.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { OWNER_NAV_COPY } from "@/features/workspace/ui/owner-nav/owner-nav.copy";
import { OWNER_SHELL_COPY } from "@/features/workspace/ui/owner-shell/owner-shell.copy";
import { WORKSPACE_SWITCHER_COPY } from "@/features/workspace/ui/workspace-switcher/workspace-switcher.copy";
import { SIDEBAR_COPY } from "@/ui/patterns/sidebar/sidebar.copy";
import { TOAST_COPY } from "@/ui/patterns/toast/toast.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

const DESKTOP = { width: 1440, height: 900 };
const TABLET = { width: 1024, height: 900 };
const PHONE = { width: 390, height: 844 };

test.setTimeout(120_000);
test.describe.configure({ retries: 2 });

async function openWorkspace(page: Page, tag: string, name: string): Promise<string> {
  await page.setViewportSize(DESKTOP);
  await registerAndVerify(page, uniqueEmail(tag));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill(name);
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  await page.getByRole("button", { name: TOAST_COPY.close }).click();
  const url = new URL(page.url());
  url.search = "";
  return url.pathname;
}

async function createSecondWorkspace(page: Page, current: string, name: string): Promise<void> {
  await page.getByRole("button", { name: current }).click();
  await page.getByRole("menuitem", { name: WORKSPACE_SWITCHER_COPY.create }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel(CREATE_WORKSPACE_COPY.label).fill(name);
  await dialog.getByRole("button", { name: CREATE_WORKSPACE_COPY.submit }).click();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(name);
  await page.getByRole("button", { name: TOAST_COPY.close }).click();
}

test("AC-SHELL-001 AC-SHELL-003 AC-SHELL-004 AC-SHELL-012 shell layouts are accessible in both themes", async ({
  page,
}) => {
  const home = await openWorkspace(page, "shell-a11y", "Aster Wedding");

  for (const theme of ["light", "dark"] as const) {
    for (const viewport of [DESKTOP, TABLET, PHONE]) {
      await page.setViewportSize(viewport);
      await page.goto(home);
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);

      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveText("Langsung ke konten");
      await expect(page.getByRole("heading", { level: 1, name: "Dasbor" })).toBeVisible();
      if (viewport === PHONE) {
        await expect(page.getByRole("button", { name: OWNER_SHELL_COPY.menu })).toBeVisible();
      } else {
        await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText(
          /Aster Wedding\s*Dasbor/,
        );
        await expect(page.getByRole("navigation", { name: "Utama" })).toBeVisible();
      }
      await expect(page.getByRole("button", { name: OWNER_SHELL_COPY.search })).toBeVisible();
      await expect(
        page.getByRole("button", { name: OWNER_SHELL_COPY.notifications }),
      ).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations, `${theme} ${String(viewport.width)}`).toEqual([]);
    }
  }
});

test("AC-SHELL-002 desktop collapse is remembered per browser", async ({ page }) => {
  const home = await openWorkspace(page, "shell-collapse", "Aster Wedding");

  await page.getByRole("button", { name: SIDEBAR_COPY.collapse }).click();
  await expect(page.getByRole("button", { name: SIDEBAR_COPY.expand })).toBeFocused();
  await page.goto(`${home}/settings`);
  await expect(page.getByRole("button", { name: SIDEBAR_COPY.expand })).toBeVisible();
  await expect(page.getByRole("button", { name: SIDEBAR_COPY.collapse })).toBeHidden();

  await page.getByRole("button", { name: SIDEBAR_COPY.expand }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: SIDEBAR_COPY.collapse })).toBeVisible();
});

test("AC-SHELL-009 switching workspaces, failure toast and retry", async ({ page }) => {
  await openWorkspace(page, "shell-switch", "Aster Wedding");
  await createSecondWorkspace(page, "Aster Wedding", "Lumen Studio");

  await page.getByRole("button", { name: "Lumen Studio" }).click();
  await expect(page.getByText(WORKSPACE_SWITCHER_COPY.menuLabel)).toBeVisible();
  await expect(page.getByRole("menuitem")).toHaveText([
    "Aster Wedding",
    "Lumen Studio",
    WORKSPACE_SWITCHER_COPY.create,
  ]);

  await page.route("**/w/**", async (route) => {
    if (route.request().headers()["next-action"]) {
      await route.abort();
      return;
    }
    await route.continue();
  });
  await page.getByRole("menuitem", { name: "Aster Wedding" }).click();
  const toast = page.getByRole("alertdialog").filter({ hasText: WORKSPACE_SWITCHER_COPY.failed });
  await expect(toast).toContainText(WORKSPACE_SWITCHER_COPY.failedBody("Lumen Studio"));
  await expect(page.locator("[inert]")).toHaveCount(0);

  await page.unrouteAll();
  await toast.getByRole("button", { name: WORKSPACE_SWITCHER_COPY.retry }).click();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Aster Wedding");
  await expect(toast).toHaveCount(0);
});

test("AC-SHELL-007 AC-SHELL-008 AC-SHELL-013 phone menu, CTA and utilities", async ({ page }) => {
  const home = await openWorkspace(page, "shell-phone", "Aster Wedding");
  await page.setViewportSize(PHONE);

  await page.getByRole("button", { name: OWNER_SHELL_COPY.menu }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("button")).toContainText([
    OWNER_NAV_COPY.services,
    OWNER_NAV_COPY.team,
    OWNER_NAV_COPY.messageTemplates,
    OWNER_NAV_COPY.clientSources,
    OWNER_NAV_COPY.settings,
  ]);
  await expect(sheet.getByText(OWNER_NAV_COPY.invoices)).toHaveCount(0);
  await sheet.getByRole("button", { name: OWNER_NAV_COPY.team }).click();
  await expect(page).toHaveURL(`${home}/team`);
  await expect(page.getByRole("heading", { level: 1, name: OWNER_NAV_COPY.team })).toBeVisible();

  await page.getByRole("button", { name: OWNER_NAV_COPY.create }).click();
  await expect(page).toHaveURL(`${home}/projects`);
  await expect(page.getByRole("link", { name: OWNER_NAV_COPY.projects })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.getByRole("button", { name: OWNER_SHELL_COPY.notifications }).click();
  await expect(page).toHaveURL(`${home}/notifications`);
  await expect(
    page.getByRole("heading", { level: 1, name: OWNER_NAV_COPY.notifications }),
  ).toBeVisible();
});

test("AC-SHELL-011 crossing a breakpoint closes the old layout's overlays", async ({ page }) => {
  const home = await openWorkspace(page, "shell-resize", "Aster Wedding");
  await page.goto(`${home}/clients`);

  await page.setViewportSize(PHONE);
  await page.getByRole("button", { name: OWNER_SHELL_COPY.menu }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.setViewportSize(DESKTOP);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("[inert]")).toHaveCount(0);
  await expect(page).toHaveURL(`${home}/clients`);

  await page.setViewportSize(TABLET);
  await page.getByRole("button", { name: SIDEBAR_COPY.expand }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.setViewportSize(DESKTOP);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: OWNER_NAV_COPY.clients, exact: true }),
  ).toHaveAttribute("aria-current", "page");
});
