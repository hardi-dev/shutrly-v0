import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { CLIENT_COPY } from "@/features/booking/ui/client-copy/client-copy.copy";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { TEAM_COPY } from "@/features/booking/ui/team-copy/team-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

test.setTimeout(150_000);
test.describe.configure({ retries: 2 });

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectA11y(page: Page): Promise<void> {
  await expect(page.locator("[data-entering], [data-exiting]")).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .withTags(axeTags)
    .exclude('[role="log"][aria-relevant="additions"]')
    .analyze();
  expect(results.violations).toEqual([]);
}

async function openWorkspace(page: Page): Promise<string> {
  await registerAndVerify(page, uniqueEmail("session-team"));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Session Team Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  return new URL(page.url()).pathname.split("/")[2];
}

async function addClient(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/clients`);
  await page.getByRole("button", { name: CLIENT_COPY.addClient }).first().click();
  const dialog = page
    .getByRole("dialog", { name: CLIENT_COPY.dialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: CLIENT_COPY.name }).fill("Rina");
  await dialog.getByRole("textbox", { name: CLIENT_COPY.whatsappNumber }).fill("0812-3456-7890");
  await dialog.getByRole("button", { name: CLIENT_COPY.save }).click();
  await expect(dialog).toBeHidden();
}

async function addService(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/services`);
  await page
    .getByRole("button", { name: CATALOG_COPY.addService })
    .filter({ visible: true })
    .first()
    .click();
  const serviceDialog = page
    .getByRole("dialog", { name: CATALOG_COPY.addServiceTitle })
    .filter({ visible: true })
    .first();
  await serviceDialog.getByRole("button", { name: CATALOG_COPY.addCategoryInline }).click();
  const categoryDialog = page
    .getByRole("dialog", { name: CATALOG_COPY.categoryDialogAddTitle })
    .filter({ visible: true })
    .first();
  await categoryDialog.getByRole("textbox", { name: CATALOG_COPY.nameCategory }).fill("Wisuda");
  await categoryDialog.getByRole("button", { name: CATALOG_COPY.save }).click();
  await expect(categoryDialog).toBeHidden();
  await serviceDialog.getByRole("textbox", { name: CATALOG_COPY.nameService }).fill("Wisuda Basic");
  await serviceDialog.getByRole("textbox", { name: CATALOG_COPY.basePrice }).fill("750000");
  await serviceDialog.getByRole("button", { name: CATALOG_COPY.save }).click();
  await expect(page).toHaveURL(/\/services\/[0-9a-f-]+$/);
}

async function addMember(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/team`);
  await page.getByRole("button", { name: TEAM_COPY.addMember }).first().click();
  const dialog = page.getByRole("dialog", { name: TEAM_COPY.addMember }).filter({ visible: true });
  await dialog.getByLabel(TEAM_COPY.memberName, { exact: true }).fill("Dimas Pratama");
  await dialog.getByLabel(TEAM_COPY.memberWhatsapp).fill("0812 9876 5432");
  await dialog.getByRole("button", { name: new RegExp(`^${TEAM_COPY.memberRoles}`) }).click();
  await page.getByRole("option", { name: "Fotografer" }).click();
  await page.getByRole("option", { name: "Videografer" }).click();
  await page.keyboard.press("Escape");
  await dialog.getByRole("button", { name: TEAM_COPY.save }).click();
  await expect(dialog).toBeHidden();
}

async function createBookedProject(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/projects/new`);
  await page.getByRole("combobox", { name: PROJECT_COPY.clientLabel }).click();
  await page.getByRole("option", { name: /Rina/ }).click();
  await page.getByRole("button", { name: new RegExp(PROJECT_COPY.serviceLabel) }).click();
  await page.getByRole("option", { name: "Wisuda Basic" }).click();
  await page.getByRole("button", { name: PROJECT_COPY.addSessionDesktop }).click();
  const dialog = page
    .getByRole("dialog", { name: PROJECT_COPY.sessionDialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: PROJECT_COPY.sessionName }).fill("Resepsi");
  await dialog.getByRole("button", { name: new RegExp(PROJECT_COPY.sessionDate) }).click();
  await page.getByRole("grid").getByText("15", { exact: true }).first().click();
  await dialog.getByRole("button", { name: PROJECT_COPY.sessionSave }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: PROJECT_COPY.create }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=created$/);
}

test.describe("AC-TEAM-011 AC-TEAM-013 AC-TEAM-021 AC-TEAM-026 AC-TEAM-027 Jadwal staffing", () => {
  test("a session without members points to Tim, then a member is staffed with a changed role", async ({
    page,
  }) => {
    const workspaceId = await openWorkspace(page);
    await addClient(page, workspaceId);
    await addService(page, workspaceId);
    await createBookedProject(page, workspaceId);

    const addTeam = page.getByRole("button", { name: PROJECT_COPY.addTeamFor("Resepsi") });
    await addTeam.click();
    const form = page
      .getByRole("dialog", { name: PROJECT_COPY.assignTitle("Resepsi") })
      .filter({ visible: true });
    await expect(form.getByText(PROJECT_COPY.assignEmptyTitle)).toBeVisible();
    await expect(form.getByRole("button", { name: PROJECT_COPY.assignSubmit })).toBeDisabled();
    await expectA11y(page);
    await form.getByRole("button", { name: PROJECT_COPY.assignEmptyAction }).click();
    await expect(page).toHaveURL(new RegExp(`/w/${workspaceId}/team$`));

    await addMember(page, workspaceId);
    await page.goBack();
    await page.goBack();
    await expect(addTeam).toBeVisible();
    await addTeam.click();
    await form.getByRole("button", { name: new RegExp(`^${PROJECT_COPY.assignMember}`) }).click();
    await page.getByRole("option", { name: "Dimas Pratama" }).click();
    await expect(
      form.getByRole("button", { name: new RegExp(`^${PROJECT_COPY.assignRole}`) }),
    ).toContainText("Fotografer");
    await form.getByRole("button", { name: new RegExp(`^${PROJECT_COPY.assignRole}`) }).click();
    await page.getByRole("option", { name: "Videografer" }).click();
    await form.getByRole("button", { name: PROJECT_COPY.assignSubmit }).click();

    await expect(page.getByText(PROJECT_COPY.assignedToastTitle)).toBeVisible();
    await expect(
      page.getByRole("button", { name: PROJECT_COPY.teamGroupLabel("Resepsi", 1) }),
    ).toContainText("DP");
    await expect(addTeam).toHaveCount(0);
    await expect(page.getByText(PROJECT_COPY.statusBooked).first()).toBeVisible();
    await expectA11y(page);

    // AC-TEAM-007: an assigned member cannot be deleted, only archived.
    await page.goto(`/w/${workspaceId}/team`);
    await page.getByRole("button", { name: TEAM_COPY.rowActions("Dimas Pratama") }).click();
    await page.getByRole("menuitem", { name: TEAM_COPY.delete }).click();
    await page.getByRole("button", { name: TEAM_COPY.delete, exact: true }).click();
    await expect(page.getByText(TEAM_COPY.memberDeleteBlockedTitle("Dimas Pratama"))).toBeVisible();
  });
});
