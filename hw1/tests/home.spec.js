import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("hero visible", async ({ page }) => {
    await page.goto("/");
    // 不鎖定字串，抓第一個 h1
    const heroTitle = page.locator("main h1").first();
    await expect(heroTitle).toBeVisible();
  });
  test("skip link is focusable", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab"); // focus skip link first
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeVisible();
  });
});

