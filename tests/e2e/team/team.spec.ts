import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { TEAM_COPY_NAMESPACE } from "@/features/booking/ui/team-copy/team-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";
import { visibleText } from "./team-e2e";

const teamT = copyTranslator(TEAM_COPY_NAMESPACE, "id");

test.setTimeout(90_000);
test.describe.configure({ retries: 2 });

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectTeamA11y(page: Page): Promise<void> {
  await expect(page.locator("[data-entering], [data-exiting]")).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .withTags(axeTags)
    .exclude('[role="log"][aria-relevant="additions"]')
    .analyze();
  expect(results.violations).toEqual([]);
}

async function openWorkspace(page: Page, label: string): Promise<string> {
  await registerAndVerify(page, uniqueEmail(label));
  await page.getByLabel(ONBOARDING_COPY.messages.id.nameLabel).fill("Team Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.messages.id.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  return new URL(page.url()).pathname.split("/")[2];
}

async function addRole(page: Page, name: string): Promise<void> {
  const mobile = page.viewportSize()?.width === 390;
  await page
    .getByRole("button", { name: mobile ? teamT("addRoleShort") : teamT("addRole") })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: teamT("addRole") }).filter({ visible: true });
  await dialog.getByRole("textbox", { name: teamT("roleName") }).fill(name);
  await dialog.getByRole("button", { name: teamT("save") }).click();
}

test.describe("AC-TEAM-008 AC-TEAM-009 Tim › Peran", () => {
  test("a new workspace lists the three default roles, then adds, rejects a duplicate and deletes", async ({
    page,
  }) => {
    const workspaceId = await openWorkspace(page, "team-roles");
    await page.goto(`/w/${workspaceId}/team/roles`);

    for (const name of ["Asisten", "Fotografer", "Videografer"])
      await expect(visibleText(page, name, { exact: true })).toBeVisible();
    await expect(visibleText(page, teamT("rolesCountDesktop", { count: 3 }))).toBeVisible();
    await expectTeamA11y(page);

    await addRole(page, "Drone");
    await expect(visibleText(page, "Drone", { exact: true })).toBeVisible();

    await addRole(page, "drone");
    await expect(visibleText(page, teamT("roleErrorDuplicate"))).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: teamT("rowActions", { name: "Drone" }) }).click();
    await page.getByRole("menuitem", { name: teamT("delete") }).click();
    await page.getByRole("button", { name: teamT("delete"), exact: true }).click();
    await expect(visibleText(page, "Drone", { exact: true })).toHaveCount(0);
  });

  test("AC-TEAM-022 another workspace's roles page is not found", async ({ page }) => {
    await openWorkspace(page, "team-isolation");
    const response = await page.goto(`/w/${crypto.randomUUID()}/team/roles`);
    expect(response?.status()).toBe(404);
  });
});

async function addMember(page: Page, fields: { name: string; number: string; role: string }) {
  const mobile = page.viewportSize()?.width === 390;
  await page
    .getByRole("button", { name: mobile ? teamT("addMemberShort") : teamT("addMember") })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: teamT("addMember") }).filter({ visible: true });
  await dialog.getByLabel(teamT("memberName"), { exact: true }).fill(fields.name);
  await dialog.getByLabel(teamT("memberWhatsapp")).fill(fields.number);
  await dialog.getByRole("button", { name: new RegExp(`^${teamT("memberRoles")}`) }).click();
  await page.getByRole("option", { name: fields.role }).click();
  await page.keyboard.press("Escape");
  await dialog.getByRole("button", { name: teamT("save") }).click();
}

test.describe("AC-TEAM-001 AC-TEAM-002 AC-TEAM-003 AC-TEAM-004 Tim › Anggota", () => {
  test("a new workspace shows the empty state, then adds, searches and rejects a taken number", async ({
    page,
  }) => {
    const workspaceId = await openWorkspace(page, "team-members");
    await page.goto(`/w/${workspaceId}/team`);
    await expect(visibleText(page, teamT("emptyActiveTitle"))).toBeVisible();
    await expectTeamA11y(page);

    await addMember(page, { name: "Rina Saputri", number: "0812 3456 7890", role: "Fotografer" });
    await expect(visibleText(page, "Rina Saputri")).toBeVisible({ timeout: 15_000 });
    await expect(visibleText(page, "+62 812-3456-7890")).toBeVisible();
    await expect(visibleText(page, teamT("activeMembersCount", { count: 1 }))).toBeVisible();

    await page
      .getByRole("searchbox", { name: teamT("searchLabel") })
      .first()
      .fill("zzz");
    await expect(visibleText(page, teamT("noMatchTitle"))).toBeVisible();
    await page
      .getByRole("searchbox", { name: teamT("searchLabel") })
      .first()
      .fill("");
    await expect(visibleText(page, "Rina Saputri")).toBeVisible();

    await addMember(page, { name: "Rina Kedua", number: "0812 3456 7890", role: "Fotografer" });
    await expect(visibleText(page, teamT("whatsappTaken", { name: "Rina Saputri" }))).toBeVisible();
    await page.keyboard.press("Escape");

    await page.goto(`/w/${workspaceId}/team/archived`);
    await expect(visibleText(page, teamT("emptyArchivedTitle"))).toBeVisible();
  });
});

test.describe("AC-TEAM-007 AC-TEAM-023 Tim › row menu", () => {
  test("archives with Batalkan, restores from Arsip and deletes an unassigned member", async ({
    page,
  }) => {
    const workspaceId = await openWorkspace(page, "team-menu");
    await page.goto(`/w/${workspaceId}/team`);
    await addMember(page, { name: "Dimas Pratama", number: "0812 9876 5432", role: "Fotografer" });
    await expect(visibleText(page, "Dimas Pratama")).toBeVisible();

    const rowActions = teamT("rowActions", { name: "Dimas Pratama" });
    await page.getByRole("button", { name: rowActions }).click();
    const whatsapp = page.getByRole("menuitem", { name: teamT("openWhatsapp") });
    await expect(whatsapp).toHaveAttribute("href", "https://wa.me/6281298765432");
    await page.getByRole("menuitem", { name: teamT("archive") }).click();
    await expect(
      visibleText(page, teamT("archivedTitle", { name: "Dimas Pratama" })),
    ).toBeVisible();
    await page.getByRole("button", { name: teamT("undo") }).click();
    await expect(visibleText(page, "Dimas Pratama").first()).toBeVisible();

    await page.getByRole("button", { name: rowActions }).click();
    await page.getByRole("menuitem", { name: teamT("archive") }).click();
    await page.goto(`/w/${workspaceId}/team/archived`);
    await expect(visibleText(page, "Dimas Pratama")).toBeVisible();
    await page.getByRole("button", { name: rowActions }).click();
    await page.getByRole("menuitem", { name: teamT("restore") }).click();
    await expect(
      visibleText(page, teamT("restoredTitle", { name: "Dimas Pratama" })),
    ).toBeVisible();

    await page.goto(`/w/${workspaceId}/team`);
    await page.getByRole("button", { name: rowActions }).click();
    await page.getByRole("menuitem", { name: teamT("delete") }).click();
    await page.getByRole("button", { name: teamT("delete"), exact: true }).click();
    await expect(visibleText(page, teamT("emptyActiveTitle"))).toBeVisible();
  });
});
