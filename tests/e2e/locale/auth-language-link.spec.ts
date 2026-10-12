import { expect, type Page, test } from "@playwright/test";

import { LOGIN_FORM_COPY } from "@/features/auth/ui/login-form/login-form.copy";
import { LOGIN_SCREEN_COPY } from "@/features/auth/ui/login-screen/login-screen.copy";

// A hydration or missing-message warning is a failure, not noise (I1 done-when).
const hydrationProblems: string[] = [];
test.beforeEach(({ page }) => {
  hydrationProblems.length = 0;
  page.on("console", (message) => {
    if (/hydrat|missing message/i.test(message.text())) hydrationProblems.push(message.text());
  });
});
test.afterEach(() => {
  expect(hydrationProblems).toEqual([]);
});

const VIEWPORTS = [
  { label: "desktop 1440 × 900", size: { width: 1440, height: 900 }, mobile: false },
  { label: "390 × 844", size: { width: 390, height: 844 }, mobile: true },
] as const;

/** Opens the language link and picks Bahasa Indonesia: a Menu at lg, a Bottom Sheet below. */
async function chooseIndonesian(page: Page, mobile: boolean): Promise<void> {
  await page.getByRole("button", { name: "Language", exact: true }).click();
  const option = mobile
    ? page.getByRole("button", { name: "Bahasa Indonesia", exact: true })
    : page.getByRole("menuitem", { name: "Bahasa Indonesia", exact: true });
  await option.click();
}

for (const { label, size, mobile } of VIEWPORTS) {
  test.describe(label, () => {
    test.use({ viewport: size });

    test("AC-L10N-001 a visitor switches the login screen to Indonesian and it stays after reload", async ({
      page,
    }) => {
      await page.goto("/login");
      await expect(page.locator("html")).toHaveAttribute("lang", "en");

      await chooseIndonesian(page, mobile);
      await expect(page.locator("html")).toHaveAttribute("lang", "id");
      await expect(
        page.getByText(LOGIN_SCREEN_COPY.messages.id.title, { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: LOGIN_FORM_COPY.messages.id.submit, exact: true }),
      ).toBeVisible();

      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("lang", "id");
      await expect(
        page.getByText(LOGIN_SCREEN_COPY.messages.id.title, { exact: true }),
      ).toBeVisible();
    });

    test("AC-L10N-001 the register screen shows the same language link", async ({ page }) => {
      await page.goto("/register");
      await expect(page.locator("html")).toHaveAttribute("lang", "en");

      await expect(page.getByRole("button", { name: "Language", exact: true })).toBeVisible();
      await chooseIndonesian(page, mobile);
      await expect(page.locator("html")).toHaveAttribute("lang", "id");
    });

    test("AC-L10N-004 typed login values survive a language switch", async ({ page }) => {
      const email = "owner.locale@test.shutrly.dev";
      await page.goto("/login");
      await page.getByLabel(LOGIN_FORM_COPY.messages.id.email, { exact: true }).fill(email);

      await chooseIndonesian(page, mobile);
      await expect(page.locator("html")).toHaveAttribute("lang", "id");
      await expect(page.getByLabel(LOGIN_FORM_COPY.messages.id.email, { exact: true })).toHaveValue(
        email,
      );
    });
  });
}
