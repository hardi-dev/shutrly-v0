import { expect, test } from "@playwright/test";

import { uniqueEmail } from "../auth/auth-e2e";

// AC-SFX-001…003: with JavaScript off, every D1 form is a POST whose submit stays disabled, so
// nothing reaches a URL, and a native POST changes nothing (F-24 D1).
test.use({ javaScriptEnabled: false });

const PASSWORD = "correct-horse";

/** Pressing Enter in a filled field must not submit, and no POST may leave the page. */
async function expectEnterDoesNothing(
  page: import("@playwright/test").Page,
  path: string,
  fieldName: string,
): Promise<void> {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page.goto(path);
  await page.locator(`input[name="${fieldName}"]`).first().fill("sfx@shutrly.test");
  await page.locator(`input[name="${fieldName}"]`).first().press("Enter");
  expect(new URL(page.url()).search).toBe("");
  expect(posts).toEqual([]);
}

for (const path of ["/register", "/login", "/forgot-password"]) {
  test(`AC-SFX-001 AC-SFX-002 ${path} is a post with submit disabled and Enter does nothing`, async ({
    page,
  }) => {
    await page.goto(path);
    const form = page.locator("form").first();
    await expect(form).toHaveAttribute("method", "post");
    await expect(form.locator('button[type="submit"]')).toBeDisabled();
  });

  test(`AC-SFX-002 Enter in a filled field does not submit on ${path}`, async ({ page }) => {
    await expectEnterDoesNothing(page, path, "email");
  });
}

test("AC-SFX-001 AC-SFX-002 landing waitlist is a post with submit disabled", async ({ page }) => {
  await page.goto("/");
  const form = page.locator('form:has(input[name="email"])').first();
  await expect(form).toHaveAttribute("method", "post");
  await expect(form.locator('button[type="submit"]')).toBeDisabled();
  await expectEnterDoesNothing(page, "/", "email");
});

test("AC-SFX-003 a native post to register creates no account and echoes nothing", async ({
  request,
}) => {
  const email = uniqueEmail("sfx-register");
  const response = await request.post("/register", {
    form: { name: "Sfx Native", email, password: PASSWORD },
  });
  expect([200, 405]).toContain(response.status());
  expect(await response.text()).not.toContain(email);
  expect(response.headers()["set-cookie"] ?? "").not.toMatch(/session/i);
  const links = await request.get(`/api/test/auth-emails?to=${encodeURIComponent(email)}`);
  expect(await links.json()).toEqual([]);
});

test("AC-SFX-003 a native post to login starts no session and echoes nothing", async ({
  request,
}) => {
  const email = uniqueEmail("sfx-login");
  const response = await request.post("/login", { form: { email, password: PASSWORD } });
  expect([200, 405]).toContain(response.status());
  expect(await response.text()).not.toContain(PASSWORD);
  expect(response.headers()["set-cookie"] ?? "").not.toMatch(/session/i);
});

// Needs a published gallery over the fake Drive: the dev server must run with E2E_FAKE_DRIVE=1
// (not set in .dev.vars). Set E2E_CLIENT_GALLERY_PATH=/g/<token> to run it against that gallery.
const galleryPath = process.env.E2E_CLIENT_GALLERY_PATH;
// Runs only with a published gallery: without E2E_CLIENT_GALLERY_PATH the case is skipped.
const galleryCase = galleryPath ? test : test.skip;

galleryCase(
  "AC-SFX-001 client gallery password form is a post with submit disabled",
  async ({ page }) => {
    await page.goto(galleryPath ?? "/");
    const form = page.locator("form").first();
    await expect(form).toHaveAttribute("method", "post");
    await expect(form.locator('button[type="submit"]')).toBeDisabled();
  },
);
