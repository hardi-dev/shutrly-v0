import { existsSync, readFileSync } from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { parse } from "dotenv";

import { LOGIN_FORM_COPY } from "@/features/auth/ui/login-form/login-form.copy";
import { DASHBOARD_OVERVIEW_COPY } from "@/features/booking/ui/dashboard-overview/dashboard-overview.copy";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";

// The named test Owner is kept in the git-ignored .env.test (scripts/dev/show-test-owner.sh).
// Only the last test changes data: it adds two drafts to the test Owner and confirms them (plan 7.1).
const testEnv: Record<string, string | undefined> = existsSync(".env.test")
  ? parse(readFileSync(".env.test"))
  : {};
const OWNER_EMAIL = process.env.TEST_OWNER_EMAIL ?? testEnv.TEST_OWNER_EMAIL;
const OWNER_PASSWORD = process.env.TEST_OWNER_PASSWORD ?? testEnv.TEST_OWNER_PASSWORD;

const en = DASHBOARD_OVERVIEW_COPY.messages.en;
const project = PROJECT_COPY.messages.en;
const login = LOGIN_FORM_COPY.messages.en;
const DEVICE_LOCALE_COOKIE = "shutrly_locale";
const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.setTimeout(120_000);

/** Signs the test Owner in through the login form and returns the workspace id from the URL (AC-DASH-001). Fails loudly when the test Owner is not configured. @returns the workspace id */
async function signIn(page: Page): Promise<string> {
  if (!OWNER_EMAIL || !OWNER_PASSWORD) {
    throw new Error("TEST_OWNER_EMAIL and TEST_OWNER_PASSWORD are not set; see .env.test");
  }
  await page
    .context()
    .addCookies([{ name: DEVICE_LOCALE_COOKIE, value: "en", domain: "localhost", path: "/" }]);
  await page.goto("/login");
  await page.getByLabel(login.email).fill(OWNER_EMAIL);
  await page.getByRole("textbox", { name: login.password }).fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: login.submit }).click();
  // The first visit compiles /workspace and the dashboard in dev, so allow more than the default.
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/, { timeout: 30_000 });
  return new URL(page.url()).pathname.split("/")[2];
}

async function expectNoA11yViolations(page: Page): Promise<void> {
  await expect(page.locator("[data-entering], [data-exiting]")).toHaveCount(0);
  const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  expect(results.violations).toEqual([]);
}

test("AC-DASH-001 AC-DASH-002 an Owner with a project sees the overview, not the checklist", async ({
  page,
}) => {
  await signIn(page);
  await expect(page.getByRole("heading", { name: en.tableTitle })).toBeVisible();
  await expect(
    page.getByText(en.tileNewProjects, { exact: true }).filter({ visible: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Set up your workspace" })).toHaveCount(0);
});

test("AC-DASH-036 AC-DASH-037 the search keeps its URL across a reload and clears back to the overview", async ({
  page,
}) => {
  const workspaceId = await signIn(page);
  const search = page.getByRole("searchbox", { name: project.searchLabel });
  await search.fill("zz-no-match");
  await expect(page).toHaveURL(new RegExp(`/w/${workspaceId}\\?q=zz-no-match$`));
  await expect(
    page.getByText(project.noMatchTitle).filter({ visible: true }).first(),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByRole("searchbox", { name: project.searchLabel })).toHaveValue(
    "zz-no-match",
  );
  await page.getByRole("link", { name: project.clearSearch }).click();
  await expect(page).toHaveURL(new RegExp(`/w/${workspaceId}$`));
});

test("AC-DASH-030 the row menu is reachable from the keyboard and named for its project", async ({
  page,
}) => {
  await signIn(page);
  const menu = page.getByRole("button", { name: /^Actions for / }).first();
  await expect(menu).toBeVisible();
  await menu.focus();
  await expect(menu).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
});

test("AC-DASH-020 the overview has no WCAG A/AA violations on desktop and on the phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await signIn(page);
  await expectNoA11yViolations(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectNoA11yViolations(page);
});

test("AC-DASH-026 on the phone the active projects are list cards with a full-width link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await expect(page.getByRole("list", { name: en.tableTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: en.footerLink })).toBeVisible();
});

/** Adds a draft from the first client and the first service, with one session on the 15th; returns the project id (AC-PRJ-029). @returns the project id */
async function createDraft(page: Page, workspaceId: string): Promise<string> {
  await page.goto(`/w/${workspaceId}/projects/new`);
  await page.getByRole("combobox", { name: project.clientLabel }).click();
  await page.getByRole("option").first().click();
  await page.getByRole("button", { name: new RegExp(project.serviceLabel) }).click();
  await page.getByRole("option").first().click();
  await page.getByRole("button", { name: project.addSession }).click();
  const dialog = page
    .getByRole("dialog", { name: project.sessionDialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: project.sessionName }).fill("Sesi e2e");
  await dialog.getByRole("button", { name: new RegExp(project.sessionDate) }).click();
  await page.getByRole("grid").getByText("15", { exact: true }).first().click();
  await dialog.getByRole("button", { name: project.sessionSave }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Sesi e2e").filter({ visible: true }).first()).toBeVisible();
  await page.getByRole("button", { name: project.saveDraft }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=/, { timeout: 30_000 });
  const id = /\/projects\/([0-9a-f-]+)/.exec(page.url());
  if (!id) throw new Error("the draft's URL has no project id");
  return id[1];
}

/** The dashboard row of one project (AC-DASH-026). @returns the row locator */
function rowOf(page: Page, workspaceId: string, id: string) {
  return page
    .getByRole("row")
    .filter({ has: page.locator(`a[href="/w/${workspaceId}/projects/${id}"]`) })
    .first();
}

/** The active total from the table footer, *Showing N of M active projects* (AC-DASH-026). @returns M */
async function activeTotal(page: Page): Promise<number> {
  const footer = page
    .getByText(/Showing \d+ of \d+/)
    .filter({ visible: true })
    .first();
  const match = /of (\d+)/.exec((await footer.textContent()) ?? "");
  if (!match) throw new Error("the footer has no active total");
  return Number(match[1]);
}

test("AC-DASH-030 AC-DASH-032 drafts confirmed from the row menu and from their page show on the overview", async ({
  page,
}) => {
  const workspaceId = await signIn(page);
  await page.goto(`/w/${workspaceId}`);
  const before = await activeTotal(page);

  const menuDraft = await createDraft(page, workspaceId);
  await page.goto(`/w/${workspaceId}`);
  expect(await activeTotal(page)).toBe(before + 1);
  await rowOf(page, workspaceId, menuDraft)
    .getByRole("button", { name: /^Actions for / })
    .click();
  await page.getByRole("menuitem", { name: project.stepConfirm }).click();
  await expect(rowOf(page, workspaceId, menuDraft).getByText(project.statusBooked)).toBeVisible();

  const pageDraft = await createDraft(page, workspaceId);
  await page.goto(`/w/${workspaceId}/projects/${pageDraft}`);
  await page
    .getByRole("button", { name: project.stepConfirm })
    .filter({ visible: true })
    .first()
    .click();
  await expect(
    page.getByText(project.toastConfirmedTitle).filter({ visible: true }).first(),
  ).toBeVisible();

  await page.goto(`/w/${workspaceId}`);
  await expect(rowOf(page, workspaceId, pageDraft).getByText(project.statusBooked)).toBeVisible();
  expect(await activeTotal(page)).toBe(before + 2);
});
