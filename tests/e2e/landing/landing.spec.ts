import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// F-19 S4. The waitlist endpoint is mocked at the network layer so the suite never writes to
// Resend; the real store is covered by the S2 checks against the staging segment (plan.md).
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "phone", width: 375, height: 812 },
];
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

async function answerWaitlist(page: Page, status: number, body: unknown) {
  await page.route("**/api/waitlist", (route) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }),
  );
}

// Scoped to the form: Next's route announcer is also role="alert".
const formAlert = (page: Page) => page.locator("form").getByRole("alert");

async function submit(page: Page, email: string) {
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Email address").press("Enter");
}

for (const viewport of VIEWPORTS) {
  test.describe(`landing at ${viewport.name} (${String(viewport.width)} px)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
    });

    test("AC-LND-001 AC-LND-002 AC-LND-003 shows the hero with no sideways scroll and no axe violations", async ({
      page,
    }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
        "Less busywork. More photography.",
      );
      await expect(page.getByLabel("Email address")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      await expectNoAxeViolations(page);
    });

    test("AC-LND-006 AC-LND-003 an invalid email shows the field error and stays accessible", async ({
      page,
    }) => {
      await submit(page, "rina@");
      await expect(page.getByText("Enter a valid email address")).toBeVisible();
      await expect(page.getByLabel("Email address")).toBeFocused();
      await expectNoAxeViolations(page);
    });

    test("AC-LND-010 AC-LND-003 a server failure keeps the email and announces the error", async ({
      page,
    }) => {
      await answerWaitlist(page, 200, { status: "FAILED" });
      await submit(page, "rina@example.com");
      await expect(formAlert(page)).toHaveText("That didn’t work. Please try again.");
      await expect(page.getByLabel("Email address")).toHaveValue("rina@example.com");
      await expectNoAxeViolations(page);
    });

    test("AC-LND-008 AC-LND-003 the edge's 429 asks to try again in a moment", async ({ page }) => {
      await answerWaitlist(page, 429, "Too Many Requests");
      await submit(page, "rina@example.com");
      await expect(formAlert(page)).toHaveText("Too many attempts. Please try again in a moment.");
      await expectNoAxeViolations(page);
    });

    test("AC-LND-005 AC-LND-003 joining replaces the form and focuses the confirmation", async ({
      page,
    }) => {
      await answerWaitlist(page, 200, { status: "JOINED" });
      await submit(page, " Rina@Example.com ");
      await expect(page.getByText("You’re on the list.")).toBeFocused();
      await expect(page.getByLabel("Email address")).toHaveCount(0);
      await expectNoAxeViolations(page);
    });
  });
}

test("AC-LND-005 sends the trimmed email and an empty bot field", async ({ page }) => {
  await page.goto("/");
  const sent = page.waitForRequest("**/api/waitlist");
  await answerWaitlist(page, 200, { status: "JOINED" });
  await submit(page, " Rina@Example.com ");
  expect((await sent).postDataJSON()).toEqual({ email: "Rina@Example.com", website: "" });
});

test("AC-LND-003 the keyboard reaches the field and the button with a visible focus, never the bot field", async ({
  page,
}) => {
  await page.goto("/");
  const email = page.getByLabel("Email address");
  const focused: string[] = [];
  for (let press = 0; press < 12; press++) {
    await page.keyboard.press("Tab");
    focused.push(await page.evaluate(() => document.activeElement?.getAttribute("name") ?? ""));
    if (await email.evaluate((element) => element === document.activeElement)) break;
  }
  await expect(email).toBeFocused();
  expect(focused).not.toContain("website");
  const ring = await email.evaluate(
    (element) => getComputedStyle(element.parentElement ?? element).outlineColor,
  );
  expect(ring).not.toBe("rgba(0, 0, 0, 0)");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /join/i })).toBeFocused();
});

test("design.md the headline stays on busywork. when the visitor prefers reduced motion", async ({
  page,
}) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.clock.fastForward(3 * 2800);
  const shown = page.locator("h1 span.opacity-100");
  await expect(shown).toHaveText("busywork.");
});
