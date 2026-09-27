import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const SCREENS = [
  "/login",
  "/register",
  "/forgot-password",
  "/forgot-password?state=sent",
  "/reset-password",
  "/account-unavailable",
];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

for (const viewport of VIEWPORTS) {
  for (const path of SCREENS) {
    test(`AC-AUTH-023 C-008 ${path} has no WCAG 2.1 AA violations at ${String(viewport.width)} px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);
      const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
      const results = await new AxeBuilder({ page }).withTags(tags).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("AC-AUTH-023 the email field is reachable by keyboard with a visible focus (u9HFU)", async ({
  page,
}) => {
  await page.goto("/login");
  const email = page.locator('input[type="email"]');
  for (let press = 0; press < 10; press++) {
    if (await email.evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(email).toBeFocused();
  const ring = await email.evaluate((element) => getComputedStyle(element).boxShadow);
  expect(ring).not.toBe("none");
});
