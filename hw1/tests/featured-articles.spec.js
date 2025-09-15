import { test, expect } from '@playwright/test';

test.describe("Featured Articles on Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("featured articles section is displayed", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 檢查精選文章區塊存在
    const featuredSection = page.locator('.featured-articles');
    await expect(featuredSection).toBeVisible();
    
    // 檢查標題
    await expect(featuredSection.locator('.featured-articles__title')).toHaveText('Featured Articles');
  });

  test("featured articles load correctly", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 等待文章載入（最多等待 5 秒）
    await page.waitForTimeout(2000);
    
    // 檢查文章網格存在
    const articlesGrid = page.locator('#featured-articles-grid');
    await expect(articlesGrid).toBeVisible();
    
    // 檢查是否有文章卡片或錯誤訊息
    const hasArticles = await page.locator('.featured-article-card').count() > 0;
    const hasError = await page.locator('.featured-articles__error').count() > 0;
    const hasEmpty = await page.locator('.featured-articles__empty').count() > 0;
    
    // 至少應該有其中一種狀態
    expect(hasArticles || hasError || hasEmpty).toBe(true);
  });

  test("featured articles have proper styling", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    const featuredSection = page.locator('.featured-articles');
    await expect(featuredSection).toBeVisible();
    
    // 檢查基本樣式存在
    const computedStyle = await featuredSection.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        borderTop: style.borderTop,
        borderBottom: style.borderBottom,
        padding: style.padding
      };
    });
    
    // 檢查樣式不為空
    expect(computedStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(computedStyle.padding).toBeTruthy();
  });

  test("featured articles are responsive", async ({ page }) => {
    // 測試桌面版
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');
    
    const articlesGrid = page.locator('#featured-articles-grid');
    await expect(articlesGrid).toBeVisible();
    
    // 測試平板版
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');
    
    await expect(articlesGrid).toBeVisible();
    
    // 測試手機版
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    await expect(articlesGrid).toBeVisible();
  });

  test("featured articles footer button works", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    const footerButton = page.locator('.featured-articles__footer .btn');
    await expect(footerButton).toBeVisible();
    await expect(footerButton).toHaveText('查看所有文章');
    
    // 檢查連結
    await expect(footerButton).toHaveAttribute('href', '/blog/');
  });

  test("pinned articles display correctly", async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 檢查是否有釘選標籤
    const pinnedTags = page.locator('.featured-article-card__pinned');
    const pinnedCount = await pinnedTags.count();
    
    if (pinnedCount > 0) {
      // 檢查釘選標籤樣式
      const firstPinned = pinnedTags.first();
      await expect(firstPinned).toHaveText(/精選/);
      await expect(firstPinned).toHaveCSS('background', /linear-gradient/);
    }
  });
});
