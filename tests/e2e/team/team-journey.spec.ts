import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";

import {
  addClient,
  addMember,
  addService,
  addSessionOnDetail,
  cancelProject,
  createBookedProject,
  expectA11y,
  openAturTim,
  openWorkspace,
  SARI,
  staffSession,
} from "./team-e2e";

test.setTimeout(240_000);
test.describe.configure({ retries: 2 });

const TITLE = "Wisuda Basic — Rina";

async function prepareProject(page: Page): Promise<string> {
  const workspaceId = await openWorkspace(page);
  await addClient(page, workspaceId);
  await addService(page, workspaceId);
  await addMember(page, workspaceId);
  await addMember(page, workspaceId, SARI);
  await createBookedProject(page, workspaceId);
  await addSessionOnDetail(page, "Akad", "16");
  return workspaceId;
}

async function staffTwoSessions(page: Page): Promise<void> {
  await page.getByRole("button", { name: PROJECT_COPY.addTeamFor("Resepsi") }).click();
  await staffSession(page, "Resepsi", "Fotografer");
  await page.getByRole("button", { name: PROJECT_COPY.addTeamFor("Akad") }).click();
  await staffSession(page, "Akad", "Asisten", "Sari Lestari");
  await expect(
    page.getByRole("button", { name: PROJECT_COPY.teamGroupLabel("Resepsi", 1) }),
  ).toContainText("DP");
  await expect(
    page.getByRole("button", { name: PROJECT_COPY.teamGroupLabel("Akad", 1) }),
  ).toContainText("SL");
}

async function addAndRemoveInAturTim(page: Page): Promise<void> {
  const team = await openAturTim(page, "Resepsi", 1);
  await team.getByRole("button", { name: PROJECT_COPY.teamAddMember }).click();
  await staffSession(page, "Resepsi", "Asisten", "Sari Lestari");
  const back = await openAturTim(page, "Resepsi", 2);
  await expect(back.getByText("Sari Lestari")).toBeVisible();
  await back.getByRole("button", { name: PROJECT_COPY.teamRemoveLabel }).nth(1).click();
  const confirm = page.getByRole("alertdialog").filter({ visible: true });
  await confirm.getByRole("button", { name: PROJECT_COPY.removeAssignmentConfirm }).click();
  await expect(page.getByText(PROJECT_COPY.removedToastTitle)).toBeVisible();
  await expect(back.getByText("Sari Lestari")).toHaveCount(0);
  await back.getByRole("button", { name: PROJECT_COPY.teamDone }).click();
}

async function expectReadOnlyAfterCancel(page: Page): Promise<void> {
  await cancelProject(page, TITLE);
  await expect(page.getByRole("button", { name: PROJECT_COPY.addTeamFor("Resepsi") })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: PROJECT_COPY.sessionActions("Resepsi") }),
  ).toHaveCount(0);
  const team = await openAturTim(page, "Resepsi", 1);
  await expect(team.getByText(PROJECT_COPY.teamCancelledNote)).toBeVisible();
  await expect(team.getByRole("button", { name: PROJECT_COPY.teamRemoveLabel })).toHaveCount(0);
  await expect(team.getByRole("button", { name: PROJECT_COPY.teamAddMember })).toHaveCount(0);
  await expectA11y(page);
  await team.getByRole("button", { name: PROJECT_COPY.teamClose }).first().click();
}

test.describe("J-03 AC-TEAM-011 AC-TEAM-014 AC-TEAM-015 AC-TEAM-026 staffing journey", () => {
  test("adds members, staffs two sessions, manages the team, then the cancelled project is read-only", async ({
    page,
  }) => {
    await prepareProject(page);
    await staffTwoSessions(page);
    await addAndRemoveInAturTim(page);
    await expect(
      page.getByRole("button", { name: PROJECT_COPY.teamGroupLabel("Resepsi", 1) }),
    ).toBeVisible();
    await expectReadOnlyAfterCancel(page);
  });
});

test.describe("AC-TEAM-022 foreign URLs", () => {
  test("another workspace's Tim routes and another account's project are not found", async ({
    page,
    browser,
  }) => {
    const workspaceId = await openWorkspace(page);
    await addClient(page, workspaceId);
    await addService(page, workspaceId);
    await createBookedProject(page, workspaceId);
    const projectPath = new URL(page.url()).pathname;

    const foreign = crypto.randomUUID();
    for (const path of ["team", "team/archived", "team/roles"]) {
      const response = await page.goto(`/w/${foreign}/${path}`);
      expect(response?.status()).toBe(404);
    }

    const other = await browser.newContext();
    const otherPage = await other.newPage();
    await openWorkspace(otherPage);
    expect((await otherPage.goto(projectPath))?.status()).toBe(404);
    await other.close();
  });
});
