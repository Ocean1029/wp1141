import { test, expect } from "@playwright/test";

test.describe("Blog Performance", () => {
  test("page load performance", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/blog/");
    await page.waitForSelector(".article-card", { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // 頁面應該在 3 秒內載入完成
    expect(loadTime).toBeLessThan(3000);
    
    // 檢查頁面標題是否正確載入
    await expect(page).toHaveTitle(/Blog/);
  });

  test("article loading performance", async ({ page }) => {
    await page.goto("/blog/");
    
    const startTime = Date.now();
    await page.waitForSelector(".article-card", { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    // 文章應該在 2 秒內載入完成
    expect(loadTime).toBeLessThan(2000);
    
    // 檢查文章數量
    const articleCards = page.locator(".article-card");
    const count = await articleCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("category filter performance", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForSelector(".category-tag", { timeout: 10000 });
    
    const categoryTags = page.locator(".category-tag:not([aria-current])");
    const firstCategory = categoryTags.first();
    
    if (await firstCategory.isVisible()) {
      const startTime = Date.now();
      await firstCategory.click();
      
      // 等待篩選完成
      await page.waitForTimeout(100);
      const filterTime = Date.now() - startTime;
      
      // 篩選應該在 500ms 內完成
      expect(filterTime).toBeLessThan(500);
    }
  });

  test("hover animation performance", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForSelector(".article-card", { timeout: 10000 });
    
    const firstCard = page.locator(".article-card").first();
    
    // 測試 hover 動畫的流暢度
    const startTime = Date.now();
    await firstCard.hover();
    await page.waitForTimeout(100); // 等待動畫開始
    const hoverTime = Date.now() - startTime;
    
    // hover 響應應該很快
    expect(hoverTime).toBeLessThan(200);
    
    // 檢查 hover 效果是否應用
    const transform = await firstCard.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    expect(transform).not.toBe("none");
  });

  test("image loading performance", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForSelector(".article-card__image", { timeout: 10000 });
    
    const images = page.locator(".article-card__image");
    const imageCount = await images.count();
    
    // 檢查所有圖片是否載入
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const image = images.nth(i);
      await expect(image).toBeVisible();
      
      // 檢查圖片是否有 src 屬性
      const src = await image.getAttribute("src");
      expect(src).toBeTruthy();
    }
  });

  test("memory usage during interactions", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForSelector(".article-card", { timeout: 10000 });
    
    // 執行多次篩選操作
    const categoryTags = page.locator(".category-tag:not([aria-current])");
    const tagCount = await categoryTags.count();
    
    for (let i = 0; i < Math.min(tagCount, 3); i++) {
      const tag = categoryTags.nth(i);
      if (await tag.isVisible()) {
        await tag.click();
        await page.waitForTimeout(100);
      }
    }
    
    // 檢查頁面是否仍然響應
    const articlesGrid = page.locator(".articles-grid");
    await expect(articlesGrid).toBeVisible();
  });

  test("responsive layout performance", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // 手機
      { width: 768, height: 1024 },  // 平板
      { width: 1200, height: 800 }   // 桌面
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      
      const startTime = Date.now();
      await page.waitForSelector(".article-card", { timeout: 10000 });
      const loadTime = Date.now() - startTime;
      
      // 每個視窗大小都應該快速載入
      expect(loadTime).toBeLessThan(2000);
      
      // 檢查文章網格是否正確顯示
      const articlesGrid = page.locator(".articles-grid");
      await expect(articlesGrid).toBeVisible();
    }
  });

  test("accessibility performance", async ({ page }) => {
    await page.goto("/blog/");
    
    // 測試鍵盤導航的響應速度
    const startTime = Date.now();
    await page.keyboard.press("Tab"); // 跳過 skip link
    await page.keyboard.press("Tab"); // 跳到第一個可聚焦元素
    const navTime = Date.now() - startTime;
    
    expect(navTime).toBeLessThan(100);
    
    // 檢查是否有元素被聚焦
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("error recovery performance", async ({ page }) => {
    // 模擬網路錯誤
    await page.route("/articles-list.json", route => {
      route.abort("failed");
    });
    
    const startTime = Date.now();
    await page.goto("/blog/");
    
    // 等待錯誤處理完成
    await page.waitForTimeout(1000);
    const errorTime = Date.now() - startTime;
    
    // 錯誤處理應該在合理時間內完成
    expect(errorTime).toBeLessThan(2000);
    
    // 頁面應該仍然可以訪問
    const articlesGrid = page.locator(".articles-grid");
    await expect(articlesGrid).toBeVisible();
  });
});
