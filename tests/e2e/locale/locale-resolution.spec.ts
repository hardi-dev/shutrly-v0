import { expect, test } from "@playwright/test";

const BASE = "http://localhost:3000";

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

test("AC-L10N-001 a first visit renders html lang en on /login", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("BR-L10N-001 a device cookie of id renders html lang id on /login", async ({
  context,
  page,
}) => {
  await context.addCookies([{ name: "shutrly_locale", value: "id", url: BASE }]);
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
});

test("AC-L10N-004 concurrent visitors with different cookies each get their own language", async ({
  browser,
}) => {
  const english = await browser.newContext();
  const indonesian = await browser.newContext();
  await indonesian.addCookies([{ name: "shutrly_locale", value: "id", url: BASE }]);
  const pageEn = await english.newPage();
  const pageId = await indonesian.newPage();
  await Promise.all([pageEn.goto("/login"), pageId.goto("/login")]);
  await expect(pageEn.locator("html")).toHaveAttribute("lang", "en");
  await expect(pageId.locator("html")).toHaveAttribute("lang", "id");
  await english.close();
  await indonesian.close();
});
