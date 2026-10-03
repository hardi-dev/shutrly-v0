import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { TEAM_COPY } from "@/features/booking/ui/team-copy/team-copy.copy";

import {
  addClient,
  addMember,
  addService,
  addSessionOnDetail,
  createBookedProject,
  expectA11y,
  openWorkspace,
  setupStaffedProject,
  staffSession,
  visibleText,
} from "../team/team-e2e";

test.setTimeout(150_000);
test.describe.configure({ retries: 2 });

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

    await expect(visibleText(page, PROJECT_COPY.assignedToastTitle)).toBeVisible();
    await expect(
      page.getByRole("button", { name: PROJECT_COPY.teamGroupLabel("Resepsi", 1) }),
    ).toContainText("DP");
    await expect(addTeam).toHaveCount(0);
    await expect(visibleText(page, PROJECT_COPY.statusBooked).first()).toBeVisible();
    await expectA11y(page);

    // AC-TEAM-007: an assigned member cannot be deleted, only archived.
    await page.goto(`/w/${workspaceId}/team`);
    await page.getByRole("button", { name: TEAM_COPY.rowActions("Dimas Pratama") }).click();
    await page.getByRole("menuitem", { name: TEAM_COPY.delete }).click();
    await page.getByRole("button", { name: TEAM_COPY.delete, exact: true }).click();
    await expect(
      visibleText(page, TEAM_COPY.memberDeleteBlockedTitle("Dimas Pratama")),
    ).toBeVisible();
  });
});

async function removeFromAturTim(page: Page): Promise<void> {
  await page.getByRole("button", { name: PROJECT_COPY.teamGroupLabel("Resepsi", 1) }).click();
  const team = page
    .getByRole("dialog", { name: PROJECT_COPY.teamTitle("Resepsi") })
    .filter({ visible: true });
  await expect(team.getByText("Dimas Pratama")).toBeVisible();
  await expect(team.getByText("Fotografer")).toBeVisible();
  await expectA11y(page);
  await team.getByRole("button", { name: PROJECT_COPY.teamRemoveLabel }).click();
  const confirm = page
    .getByRole("alertdialog", {
      name: PROJECT_COPY.removeAssignmentTitle("Dimas Pratama", "Resepsi"),
    })
    .filter({ visible: true });
  await expect(confirm.getByText(PROJECT_COPY.removeAssignmentBody("Dimas"))).toBeVisible();
  await confirm.getByRole("button", { name: PROJECT_COPY.removeAssignmentConfirm }).click();
  await expect(visibleText(page, PROJECT_COPY.removedToastTitle)).toBeVisible();
}

test.describe("AC-TEAM-014 Atur tim", () => {
  test("removing the last member closes Atur tim, and a role changes by remove then add", async ({
    page,
  }) => {
    await setupStaffedProject(page);
    await removeFromAturTim(page);
    const addTeam = page.getByRole("button", { name: PROJECT_COPY.addTeamFor("Resepsi") });
    await expect(addTeam).toBeVisible();
    await expect(page.getByRole("dialog", { name: PROJECT_COPY.teamTitle("Resepsi") })).toHaveCount(
      0,
    );

    await addTeam.click();
    await staffSession(page, "Resepsi", "Videografer");
    await page.getByRole("button", { name: PROJECT_COPY.teamGroupLabel("Resepsi", 1) }).click();
    const team = page
      .getByRole("dialog", { name: PROJECT_COPY.teamTitle("Resepsi") })
      .filter({ visible: true });
    await expect(team.getByText("Videografer")).toBeVisible();
  });
});

test.describe("AC-TEAM-020 deleting a staffed session", () => {
  test("names the team in the confirmation, removes the assignment and keeps the member", async ({
    page,
  }) => {
    const workspaceId = await setupStaffedProject(page);
    await addSessionOnDetail(page, "Akad", "16");
    await page.getByRole("button", { name: PROJECT_COPY.sessionActions("Resepsi") }).click();
    await page.getByRole("menuitem", { name: PROJECT_COPY.deleteSessionConfirm }).click();
    const confirm = page
      .getByRole("alertdialog", { name: PROJECT_COPY.deleteSessionTitle("Resepsi") })
      .filter({ visible: true });
    await expect(confirm.getByText(PROJECT_COPY.deleteSessionTeamBody(1))).toBeVisible();
    await confirm.getByRole("button", { name: PROJECT_COPY.deleteSessionConfirm }).click();
    await expect(
      page.getByRole("button", { name: PROJECT_COPY.sessionActions("Resepsi") }),
    ).toHaveCount(0);

    await page.goto(`/w/${workspaceId}/team`);
    await expect(visibleText(page, "Dimas Pratama")).toBeVisible();
  });
});
