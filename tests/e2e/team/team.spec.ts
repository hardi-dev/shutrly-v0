import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { TEAM_COPY } from "@/features/booking/ui/team-copy/team-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

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
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Team Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  return new URL(page.url()).pathname.split("/")[2];
}

async function addRole(page: Page, name: string): Promise<void> {
  const mobile = page.viewportSize()?.width === 390;
  await page
    .getByRole("button", { name: mobile ? TEAM_COPY.addRoleShort : TEAM_COPY.addRole })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: TEAM_COPY.addRole }).filter({ visible: true });
  await dialog.getByRole("textbox", { name: TEAM_COPY.roleName }).fill(name);
  await dialog.getByRole("button", { name: TEAM_COPY.save }).click();
}

test.describe("AC-TEAM-008 AC-TEAM-009 Tim › Peran", () => {
  test("a new workspace lists the three default roles, then adds, rejects a duplicate and deletes", async ({
    page,
  }) => {
    const workspaceId = await openWorkspace(page, "team-roles");
    await page.goto(`/w/${workspaceId}/team/roles`);

    for (const name of ["Asisten", "Fotografer", "Videografer"])
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.getByText(TEAM_COPY.rolesCountDesktop(3))).toBeVisible();
    await expectTeamA11y(page);

    await addRole(page, "Drone");
    await expect(page.getByText("Drone", { exact: true })).toBeVisible();

    await addRole(page, "drone");
    await expect(page.getByText(TEAM_COPY.roleErrors.DUPLICATE)).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: TEAM_COPY.rowActions("Drone") }).click();
    await page.getByRole("menuitem", { name: TEAM_COPY.delete }).click();
    await page.getByRole("button", { name: TEAM_COPY.delete, exact: true }).click();
    await expect(page.getByText("Drone", { exact: true })).toHaveCount(0);
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
    .getByRole("button", { name: mobile ? TEAM_COPY.addMemberShort : TEAM_COPY.addMember })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: TEAM_COPY.addMember }).filter({ visible: true });
  await dialog.getByLabel(TEAM_COPY.memberName, { exact: true }).fill(fields.name);
  await dialog.getByLabel(TEAM_COPY.memberWhatsapp).fill(fields.number);
  await dialog.getByRole("button", { name: new RegExp(`^${TEAM_COPY.memberRoles}`) }).click();
  await page.getByRole("option", { name: fields.role }).click();
  await page.keyboard.press("Escape");
  await dialog.getByRole("button", { name: TEAM_COPY.save }).click();
}

test.describe("AC-TEAM-001 AC-TEAM-002 AC-TEAM-003 AC-TEAM-004 Tim › Anggota", () => {
  test("a new workspace shows the empty state, then adds, searches and rejects a taken number", async ({
    page,
  }) => {
    const workspaceId = await openWorkspace(page, "team-members");
    await page.goto(`/w/${workspaceId}/team`);
    await expect(page.getByText(TEAM_COPY.emptyActiveTitle)).toBeVisible();
    await expectTeamA11y(page);

    await addMember(page, { name: "Rina Saputri", number: "0812 3456 7890", role: "Fotografer" });
    await expect(page.getByText("Rina Saputri")).toBeVisible();
    await expect(page.getByText("+62 812-3456-7890")).toBeVisible();
    await expect(page.getByText(TEAM_COPY.membersCount("ACTIVE", 1))).toBeVisible();

    await page.getByRole("searchbox", { name: TEAM_COPY.searchLabel }).first().fill("zzz");
    await expect(page.getByText(TEAM_COPY.noMatchTitle)).toBeVisible();
    await page.getByRole("searchbox", { name: TEAM_COPY.searchLabel }).first().fill("");
    await expect(page.getByText("Rina Saputri")).toBeVisible();

    await addMember(page, { name: "Rina Kedua", number: "0812 3456 7890", role: "Fotografer" });
    await expect(
      page.getByText(TEAM_COPY.memberErrors.whatsappTaken("Rina Saputri", false)),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await page.goto(`/w/${workspaceId}/team/archived`);
    await expect(page.getByText(TEAM_COPY.emptyArchivedTitle)).toBeVisible();
  });
});

test.describe("AC-TEAM-007 AC-TEAM-023 Tim › row menu", () => {
  test("archives with Batalkan, restores from Arsip and deletes an unassigned member", async ({
    page,
  }) => {
    const workspaceId = await openWorkspace(page, "team-menu");
    await page.goto(`/w/${workspaceId}/team`);
    await addMember(page, { name: "Dimas Pratama", number: "0812 9876 5432", role: "Fotografer" });
    await expect(page.getByText("Dimas Pratama")).toBeVisible();

    const rowActions = TEAM_COPY.rowActions("Dimas Pratama");
    await page.getByRole("button", { name: rowActions }).click();
    const whatsapp = page.getByRole("menuitem", { name: TEAM_COPY.openWhatsapp });
    await expect(whatsapp).toHaveAttribute("href", "https://wa.me/6281298765432");
    await page.getByRole("menuitem", { name: TEAM_COPY.archive }).click();
    await expect(page.getByText(TEAM_COPY.archivedTitle("Dimas Pratama"))).toBeVisible();
    await page.getByRole("button", { name: TEAM_COPY.undo }).click();
    await expect(page.getByText("Dimas Pratama").first()).toBeVisible();

    await page.getByRole("button", { name: rowActions }).click();
    await page.getByRole("menuitem", { name: TEAM_COPY.archive }).click();
    await page.goto(`/w/${workspaceId}/team/archived`);
    await expect(page.getByText("Dimas Pratama")).toBeVisible();
    await page.getByRole("button", { name: rowActions }).click();
    await page.getByRole("menuitem", { name: TEAM_COPY.restore }).click();
    await expect(page.getByText(TEAM_COPY.restoredTitle("Dimas Pratama"))).toBeVisible();

    await page.goto(`/w/${workspaceId}/team`);
    await page.getByRole("button", { name: rowActions }).click();
    await page.getByRole("menuitem", { name: TEAM_COPY.delete }).click();
    await page.getByRole("button", { name: TEAM_COPY.delete, exact: true }).click();
    await expect(page.getByText(TEAM_COPY.emptyActiveTitle)).toBeVisible();
  });
});
