import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { TEAM_COPY } from "@/features/booking/ui/team-copy/team-copy.copy";

import {
  addClient,
  addService,
  createBookedProject,
  expectA11y,
  openAturTim,
  openWorkspace,
  setupStaffedProject,
  visibleText,
} from "./team-e2e";

test.setTimeout(240_000);
test.describe.configure({ retries: 2 });

const VIEWPORTS = [
  { name: "desktop light", width: 1440, height: 900, colorScheme: "light" },
  { name: "desktop dark", width: 1440, height: 900, colorScheme: "dark" },
  { name: "phone light", width: 390, height: 844, colorScheme: "light" },
  { name: "phone dark", width: 390, height: 844, colorScheme: "dark" },
] as const;

async function expectDialogA11y(page: Page, name: string | RegExp): Promise<void> {
  const dialog = page.getByRole("dialog", { name }).filter({ visible: true });
  await expect(dialog).toBeVisible();
  await expectA11y(page);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
}

async function checkTimTabs(page: Page, workspaceId: string, isPhone: boolean): Promise<void> {
  for (const path of ["team", "team/archived", "team/roles"]) {
    await page.goto(`/w/${workspaceId}/${path}`);
    await expect(page.getByRole("heading", { name: "Tim" }).first()).toBeVisible();
    await expectA11y(page);
  }
  await page
    .getByRole("button", { name: isPhone ? TEAM_COPY.addRoleShort : TEAM_COPY.addRole })
    .first()
    .click();
  await expectDialogA11y(page, TEAM_COPY.addRole);
}

async function checkMemberSurfaces(
  page: Page,
  workspaceId: string,
  isPhone: boolean,
): Promise<void> {
  await page.goto(`/w/${workspaceId}/team`);
  await page
    .getByRole("button", { name: isPhone ? TEAM_COPY.addMemberShort : TEAM_COPY.addMember })
    .first()
    .click();
  await expectDialogA11y(page, TEAM_COPY.addMember);
  await page.getByRole("button", { name: TEAM_COPY.rowActions("Dimas Pratama") }).click();
  // Phones open a sheet of buttons, desktop a menu: look for the label itself.
  await expect(visibleText(page, TEAM_COPY.archive, { exact: true })).toBeVisible();
  await expectA11y(page);
  await page.keyboard.press("Escape");
}

async function checkProjectSurfaces(page: Page, projectPath: string): Promise<void> {
  await page.goto(projectPath);
  const team = await openAturTim(page, "Resepsi", 1);
  await expectA11y(page);
  await team.getByRole("button", { name: PROJECT_COPY.teamAddMember }).click();
  await expectDialogA11y(page, PROJECT_COPY.assignTitle("Resepsi"));
}

for (const viewport of VIEWPORTS) {
  test(`AC-TEAM-023 C-008 Tim and Jadwal team surfaces have no axe violations on ${viewport.name}`, async ({
    page,
  }) => {
    const workspaceId = await setupStaffedProject(page);
    const projectPath = new URL(page.url()).pathname;
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ colorScheme: viewport.colorScheme });
    const isPhone = viewport.width === 390;
    await checkTimTabs(page, workspaceId, isPhone);
    await checkMemberSurfaces(page, workspaceId, isPhone);
    await checkProjectSurfaces(page, projectPath);
  });
}

test("AC-TEAM-011 reaches user-plus by keyboard, opens the form with Enter and Esc returns focus", async ({
  page,
}) => {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId);
  await addService(page, workspaceId);
  await createBookedProject(page, workspaceId);
  const addTeam = page.getByRole("button", { name: PROJECT_COPY.addTeamFor("Resepsi") });
  await addTeam.focus();
  await expect(addTeam).toBeFocused();
  await page.keyboard.press("Enter");
  const form = page
    .getByRole("dialog", { name: PROJECT_COPY.assignTitle("Resepsi") })
    .filter({ visible: true });
  await expect(form).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(form).toBeHidden();
  await expect(addTeam).toBeFocused();
});
