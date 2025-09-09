import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("hero visible and CTA clickable via keyboard", async ({ page }) => {
    await page.goto("/");
    // 不鎖定字串，抓第一個 h1
    const heroTitle = page.locator("main h1").first();
    await expect(heroTitle).toBeVisible();
  
    const cta = page.getByRole("link", { name: /Read the About/i });
    await cta.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/about\/?/);
  });
  test("CTA clickable via mouse", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Read the About/i });
    await cta.click();
    await expect(page).toHaveURL(/\/about\/?/);
  });
  test("skip link is focusable", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab"); // focus skip link first
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
  });
});

