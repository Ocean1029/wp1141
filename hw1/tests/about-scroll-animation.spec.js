import { test, expect } from '@playwright/test';

test.describe("About Page Scroll Animation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");
  });

  test("scroll animation elements are present", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 檢查動畫元素存在
    const scrollElements = page.locator('.scroll-animate');
    const count = await scrollElements.count();
    expect(count).toBeGreaterThan(0);
    
    // 檢查動畫元素有正確的 CSS 類別
    const firstElement = scrollElements.first();
    await expect(firstElement).toHaveClass(/scroll-animate/);
  });

  test("scroll animation initial state", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 重置所有動畫元素到初始狀態
    await page.evaluate(() => {
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach(el => el.classList.remove('animate'));
    });
    
    // 檢查初始狀態
    const firstElement = page.locator('.scroll-animate').first();
    await expect(firstElement).toHaveCSS('opacity', '0');
    
    // 檢查 transform 屬性（可能是 matrix 格式）
    const transform = await firstElement.evaluate(el => getComputedStyle(el).transform);
    expect(transform).toContain('matrix');
  });

  test("scroll animation triggers on scroll", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 滾動到頁面底部
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 等待動畫完成
    await page.waitForTimeout(1000);
    
    // 檢查至少有一些元素已經動畫
    const animatedElements = page.locator('.scroll-animate.animate');
    const animatedCount = await animatedElements.count();
    expect(animatedCount).toBeGreaterThan(0);
  });

  test("scroll animation has proper CSS transitions", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    const scrollElement = page.locator('.scroll-animate').first();
    
    // 檢查過渡屬性
    await expect(scrollElement).toHaveCSS('transition', /all 0.8s/);
    await expect(scrollElement).toHaveCSS('transition-timing-function', /cubic-bezier/);
  });

  test("staggered animation delays work correctly", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 檢查技能分類有延遲
    const skillCategories = page.locator('.skill-category.scroll-animate');
    const firstSkill = skillCategories.nth(0);
    const secondSkill = skillCategories.nth(1);
    
    if (await firstSkill.count() > 0 && await secondSkill.count() > 0) {
      const firstDelay = await firstSkill.evaluate(el => 
        getComputedStyle(el).transitionDelay
      );
      const secondDelay = await secondSkill.evaluate(el => 
        getComputedStyle(el).transitionDelay
      );
      
      // 第二個元素應該有更長的延遲
      expect(secondDelay).not.toBe(firstDelay);
    }
  });

  test("scroll animation works on mobile", async ({ page }) => {
    // 設定手機版視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 檢查動畫元素存在
    const scrollElements = page.locator('.scroll-animate');
    const count = await scrollElements.count();
    expect(count).toBeGreaterThan(0);
    
    // 滾動測試
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(1000);
    
    // 檢查動畫觸發
    const animatedElements = page.locator('.scroll-animate.animate');
    const animatedCount = await animatedElements.count();
    expect(animatedCount).toBeGreaterThan(0);
  });
});
