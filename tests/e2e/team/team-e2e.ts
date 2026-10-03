import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { CLIENT_COPY } from "@/features/booking/ui/client-copy/client-copy.copy";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { TEAM_COPY } from "@/features/booking/ui/team-copy/team-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

export const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

export async function expectA11y(page: Page): Promise<void> {
  await expect(page.locator("[data-entering], [data-exiting]")).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .withTags(axeTags)
    .exclude('[role="log"][aria-relevant="additions"]')
    .analyze();
  expect(results.violations).toEqual([]);
}

export async function openWorkspace(page: Page): Promise<string> {
  await registerAndVerify(page, uniqueEmail("session-team"));
  await page.getByLabel(ONBOARDING_COPY.nameLabel).fill("Session Team Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  return new URL(page.url()).pathname.split("/")[2];
}

export async function addClient(page: Page, workspaceId: string): Promise<void> {
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

export async function addService(page: Page, workspaceId: string): Promise<void> {
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

export interface E2eMember {
  readonly name: string;
  readonly number: string;
  readonly roles: readonly string[];
}

export const DIMAS: E2eMember = {
  name: "Dimas Pratama",
  number: "0812 9876 5432",
  roles: ["Fotografer", "Videografer"],
};
export const SARI: E2eMember = {
  name: "Sari Lestari",
  number: "0813 1111 2222",
  roles: ["Asisten"],
};

export async function addMember(
  page: Page,
  workspaceId: string,
  member: E2eMember = DIMAS,
): Promise<void> {
  await page.goto(`/w/${workspaceId}/team`);
  await page.getByRole("button", { name: TEAM_COPY.addMember }).first().click();
  const dialog = page.getByRole("dialog", { name: TEAM_COPY.addMember }).filter({ visible: true });
  await dialog.getByLabel(TEAM_COPY.memberName, { exact: true }).fill(member.name);
  await dialog.getByLabel(TEAM_COPY.memberWhatsapp).fill(member.number);
  await dialog.getByRole("button", { name: new RegExp(`^${TEAM_COPY.memberRoles}`) }).click();
  for (const role of member.roles) await page.getByRole("option", { name: role }).click();
  await page.keyboard.press("Escape");
  await dialog.getByRole("button", { name: TEAM_COPY.save }).click();
  await expect(dialog).toBeHidden();
}

export async function createBookedProject(
  page: Page,
  workspaceId: string,
  teamMember?: string,
): Promise<void> {
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
  if (teamMember) await pickTeamInSessionDialog(page, dialog, teamMember);
  await dialog.getByRole("button", { name: PROJECT_COPY.sessionSave }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: PROJECT_COPY.create }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=created$/);
}

export async function staffSession(
  page: Page,
  session: string,
  role: string,
  member = "Dimas Pratama",
): Promise<void> {
  const form = page
    .getByRole("dialog", { name: PROJECT_COPY.assignTitle(session) })
    .filter({ visible: true });
  await form.getByRole("button", { name: new RegExp(`^${PROJECT_COPY.assignMember}`) }).click();
  await page.getByRole("option", { name: member }).click();
  await form.getByRole("button", { name: new RegExp(`^${PROJECT_COPY.assignRole}`) }).click();
  await page.getByRole("option", { name: role }).click();
  await form.getByRole("button", { name: PROJECT_COPY.assignSubmit }).click();
  await expect(form).toBeHidden({ timeout: 15_000 });
}

export async function setupStaffedProject(page: Page): Promise<string> {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId);
  await addService(page, workspaceId);
  await addMember(page, workspaceId);
  await createBookedProject(page, workspaceId);
  await page.getByRole("button", { name: PROJECT_COPY.addTeamFor("Resepsi") }).click();
  await staffSession(page, "Resepsi", "Fotografer");
  return workspaceId;
}

export async function addSessionOnDetail(page: Page, name: string, day: string): Promise<void> {
  await page.getByRole("button", { name: PROJECT_COPY.addSessionDesktop }).click();
  const dialog = page
    .getByRole("dialog", { name: PROJECT_COPY.sessionDialogTitle })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: PROJECT_COPY.sessionName }).fill(name);
  await dialog.getByRole("button", { name: new RegExp(PROJECT_COPY.sessionDate) }).click();
  await page.getByRole("grid").getByText(day, { exact: true }).first().click();
  await dialog.getByRole("button", { name: PROJECT_COPY.sessionSave }).click();
  await expect(dialog).toBeHidden();
}

export async function openAturTim(page: Page, session: string, count: number) {
  const group = page.getByRole("button", { name: PROJECT_COPY.teamGroupLabel(session, count) });
  const team = page
    .getByRole("dialog", { name: PROJECT_COPY.teamTitle(session) })
    .filter({ visible: true });
  // A click before hydration does nothing, so press again until the dialog is there.
  await expect(async () => {
    await group.click();
    await expect(team).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  return team;
}

export async function cancelProject(page: Page, title: string): Promise<void> {
  await page.getByRole("button", { name: PROJECT_COPY.menuActions(title) }).click();
  await page.getByRole("menuitem", { name: PROJECT_COPY.menuCancel }).click();
  const cancel = page.getByRole("dialog", { name: PROJECT_COPY.cancelDialogTitle });
  await cancel.getByRole("button", { name: PROJECT_COPY.cancelConfirm }).click();
  await expect(visibleText(page, PROJECT_COPY.cancelledTitle).first()).toBeVisible();
}

async function pickTeamInSessionDialog(
  page: Page,
  dialog: ReturnType<Page["locator"]>,
  member: string,
): Promise<void> {
  await dialog
    .getByRole("button", { name: new RegExp(`^${PROJECT_COPY.sessionTeamMember}`) })
    .click();
  await page.getByRole("option", { name: member }).click();
  await dialog.getByRole("button", { name: PROJECT_COPY.teamAddMember }).click();
  await expect(dialog.getByRole("list", { name: PROJECT_COPY.sessionTeamListLabel })).toContainText(
    member,
  );
}

/** The visible match of a text: Tim and Jadwal render a table and a phone list, one hidden by CSS. */
export function visibleText(page: Page, text: string | RegExp, options?: { exact?: boolean }) {
  return page.getByText(text, options).filter({ visible: true }).first();
}
