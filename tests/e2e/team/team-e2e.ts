import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { copyTranslator } from "@tests/support/copy/copy-messages";

import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { CLIENT_COPY_NAMESPACE } from "@/features/booking/ui/client-copy/client-copy.copy";
import { PROJECT_COPY_NAMESPACE } from "@/features/booking/ui/project-copy/project-copy.copy";
import { TEAM_COPY_NAMESPACE } from "@/features/booking/ui/team-copy/team-copy.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";

import { registerAndVerify, uniqueEmail } from "../auth/auth-e2e";

const pc = copyTranslator(PROJECT_COPY_NAMESPACE, "id");

const clientT = copyTranslator(CLIENT_COPY_NAMESPACE, "id");
const teamT = copyTranslator(TEAM_COPY_NAMESPACE, "id");

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
  await page.getByLabel(ONBOARDING_COPY.messages.id.nameLabel).fill("Session Team Studio");
  await page.getByRole("button", { name: ONBOARDING_COPY.messages.id.submit }).click();
  await expect(page).toHaveURL(/\/w\/[0-9a-f-]+(?:\?.*)?$/);
  return new URL(page.url()).pathname.split("/")[2];
}

export async function addClient(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/clients`);
  await page
    .getByRole("button", { name: clientT("addClient") })
    .first()
    .click();
  const dialog = page
    .getByRole("dialog", { name: clientT("dialogTitle") })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: clientT("name") }).fill("Rina");
  await dialog.getByRole("textbox", { name: clientT("whatsappNumber") }).fill("0812-3456-7890");
  await dialog.getByRole("button", { name: clientT("saveAdd") }).click();
  await expect(dialog).toBeHidden();
}

export async function addService(page: Page, workspaceId: string): Promise<void> {
  await page.goto(`/w/${workspaceId}/services`);
  await page
    .getByRole("button", { name: CATALOG_COPY.messages.id.addService })
    .filter({ visible: true })
    .first()
    .click();
  const serviceDialog = page
    .getByRole("dialog", { name: CATALOG_COPY.messages.id.addServiceTitle })
    .filter({ visible: true })
    .first();
  await serviceDialog
    .getByRole("button", { name: CATALOG_COPY.messages.id.addCategoryInline })
    .click();
  const categoryDialog = page
    .getByRole("dialog", { name: CATALOG_COPY.messages.id.categoryDialogAddTitle })
    .filter({ visible: true })
    .first();
  await categoryDialog
    .getByRole("textbox", { name: CATALOG_COPY.messages.id.nameCategory })
    .fill("Wisuda");
  await categoryDialog.getByRole("button", { name: CATALOG_COPY.messages.id.save }).click();
  await expect(categoryDialog).toBeHidden();
  await serviceDialog
    .getByRole("textbox", { name: CATALOG_COPY.messages.id.nameService })
    .fill("Wisuda Basic");
  await serviceDialog
    .getByRole("textbox", { name: CATALOG_COPY.messages.id.basePrice })
    .fill("750000");
  await serviceDialog.getByRole("button", { name: CATALOG_COPY.messages.id.save }).click();
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
  await page
    .getByRole("button", { name: teamT("addMember") })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: teamT("addMember") }).filter({ visible: true });
  await dialog.getByLabel(teamT("memberName"), { exact: true }).fill(member.name);
  await dialog.getByLabel(teamT("memberWhatsapp")).fill(member.number);
  await dialog.getByRole("button", { name: new RegExp(`^${teamT("memberRoles")}`) }).click();
  for (const role of member.roles) await page.getByRole("option", { name: role }).click();
  await page.keyboard.press("Escape");
  await dialog.getByRole("button", { name: teamT("save") }).click();
  await expect(dialog).toBeHidden();
}

export async function createBookedProject(
  page: Page,
  workspaceId: string,
  teamMember?: string,
): Promise<void> {
  await page.goto(`/w/${workspaceId}/projects/new`);
  await page.getByRole("combobox", { name: pc("clientLabel") }).click();
  await page.getByRole("option", { name: /Rina/ }).click();
  await page.getByRole("button", { name: new RegExp(pc("serviceLabel")) }).click();
  await page.getByRole("option", { name: "Wisuda Basic" }).click();
  await page.getByRole("button", { name: pc("addSession") }).click();
  const dialog = page
    .getByRole("dialog", { name: pc("sessionDialogTitle") })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: pc("sessionName") }).fill("Resepsi");
  await dialog.getByRole("button", { name: new RegExp(pc("sessionDate")) }).click();
  await page.getByRole("grid").getByText("15", { exact: true }).first().click();
  if (teamMember) await pickTeamInSessionDialog(page, dialog, teamMember);
  await dialog.getByRole("button", { name: pc("sessionSave") }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: pc("create") }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?state=created$/);
}

export async function staffSession(
  page: Page,
  session: string,
  role: string,
  member = "Dimas Pratama",
): Promise<void> {
  const form = page
    .getByRole("dialog", { name: pc("assignTitle", { sessionName: session }) })
    .filter({ visible: true });
  await form.getByRole("button", { name: new RegExp(`^${pc("assignMember")}`) }).click();
  await page.getByRole("option", { name: member }).click();
  await form.getByRole("button", { name: new RegExp(`^${pc("assignRole")}`) }).click();
  await page.getByRole("option", { name: role }).click();
  await form.getByRole("button", { name: pc("assignSubmit") }).click();
  await expect(form).toBeHidden({ timeout: 15_000 });
}

export async function setupStaffedProject(page: Page): Promise<string> {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId);
  await addService(page, workspaceId);
  await addMember(page, workspaceId);
  await createBookedProject(page, workspaceId);
  await page.getByRole("button", { name: pc("addTeamFor", { sessionName: "Resepsi" }) }).click();
  await staffSession(page, "Resepsi", "Fotografer");
  return workspaceId;
}

export async function addSessionOnDetail(page: Page, name: string, day: string): Promise<void> {
  await page.getByRole("button", { name: pc("addSession") }).click();
  const dialog = page
    .getByRole("dialog", { name: pc("sessionDialogTitle") })
    .filter({ visible: true });
  await dialog.getByRole("textbox", { name: pc("sessionName") }).fill(name);
  await dialog.getByRole("button", { name: new RegExp(pc("sessionDate")) }).click();
  await page.getByRole("grid").getByText(day, { exact: true }).first().click();
  await dialog.getByRole("button", { name: pc("sessionSave") }).click();
  await expect(dialog).toBeHidden();
}

export async function openAturTim(page: Page, session: string, count: number) {
  const group = page.getByRole("button", {
    name: pc("teamGroupLabel", { sessionName: session, count: count }),
  });
  const team = page
    .getByRole("dialog", { name: pc("teamTitle", { sessionName: session }) })
    .filter({ visible: true });
  // A click before hydration does nothing, so press again until the dialog is there.
  await expect(async () => {
    await group.click();
    await expect(team).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  return team;
}

export async function cancelProject(page: Page, title: string): Promise<void> {
  await page.getByRole("button", { name: pc("menuActions", { name: title }) }).click();
  await page.getByRole("menuitem", { name: pc("menuCancel") }).click();
  const cancel = page.getByRole("dialog", { name: pc("cancelDialogTitle") });
  await cancel.getByRole("button", { name: pc("cancelConfirm") }).click();
  await expect(visibleText(page, pc("cancelledTitle")).first()).toBeVisible();
}

async function pickTeamInSessionDialog(
  page: Page,
  dialog: ReturnType<Page["locator"]>,
  member: string,
): Promise<void> {
  await dialog.getByRole("button", { name: new RegExp(`^${pc("sessionTeamMember")}`) }).click();
  await page.getByRole("option", { name: member }).click();
  await dialog.getByRole("button", { name: pc("teamAddMember") }).click();
  await expect(dialog.getByRole("list", { name: pc("sessionTeamListLabel") })).toContainText(
    member,
  );
}

/** The visible match of a text: Tim and Jadwal render a table and a phone list, one hidden by CSS. */
export function visibleText(page: Page, text: string | RegExp, options?: { exact?: boolean }) {
  return page.getByText(text, options).filter({ visible: true }).first();
}
