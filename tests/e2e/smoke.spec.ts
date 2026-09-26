import { expect, test } from "@playwright/test";

test("AC-FND-015 home page renders with the Indonesian locale and token styles", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const canvas = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-semantic-surface-canvas")
      .trim(),
  );
  expect(canvas).not.toBe("");
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
});

test("AC-FND-005 health check reaches the database through a per-request pool", async ({
  request,
}) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  expect(response.headers()["cache-control"]).toContain("no-store");
});
