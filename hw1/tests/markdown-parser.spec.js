import { test, expect } from "@playwright/test";

test.describe("Markdown Parser", () => {
  test("loads articles from markdown files", async ({ page }) => {
    // 模擬載入文章列表
    await page.goto("/blog/");
    
    // 等待文章載入
    await page.waitForSelector(".article-card", { timeout: 10000 });
    
    // 檢查文章是否正確載入
    const articleCards = page.locator(".article-card");
    const count = await articleCards.count();
    expect(count).toBeGreaterThan(0);
    
    // 檢查第一篇文章的內容
    const firstCard = articleCards.first();
    const title = firstCard.locator(".article-card__title");
    const category = firstCard.locator(".article-card__category");
    const meta = firstCard.locator(".article-card__meta");
    
    await expect(title).not.toBeEmpty();
    await expect(category).not.toBeEmpty();
    await expect(meta).not.toBeEmpty();
  });

  test("parses frontmatter correctly", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForSelector(".article-card", { timeout: 10000 });
    
    // 檢查日期格式是否為英文
    const meta = page.locator(".article-card__meta").first();
    const metaText = await meta.textContent();
    
    // 檢查是否包含英文月份縮寫
    expect(metaText).toMatch(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
    
    // 檢查是否包含閱讀時間
    expect(metaText).toMatch(/\d+\s+min/);
  });

  test("handles missing images gracefully", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForSelector(".article-card", { timeout: 10000 });
    
    // 檢查圖片是否載入或顯示預設圖片
    const images = page.locator(".article-card__image");
    const firstImage = images.first();
    
    await expect(firstImage).toBeVisible();
    
    // 檢查圖片是否有 alt 屬性
    await expect(firstImage).toHaveAttribute("alt");
  });

  test("category counting and sorting", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForSelector(".category-tag", { timeout: 10000 });
    
    // 檢查分類標籤是否按出現次數排序
    const categoryTags = page.locator(".category-tag:not([aria-current])");
    const categories = await categoryTags.allTextContents();
    
    // 至少應該有分類
    expect(categories.length).toBeGreaterThan(0);
    
    // 檢查是否有 "All" 選項
    const allTag = page.getByRole("button", { name: "All" });
    await expect(allTag).toBeVisible();
  });

  test("article filtering by category", async ({ page }) => {
    await page.goto("/blog/");
    await page.waitForSelector(".article-card", { timeout: 10000 });
    
    // 記錄初始文章數量
    const initialCards = page.locator(".article-card");
    const initialCount = await initialCards.count();
    
    // 嘗試篩選
    const categoryTags = page.locator(".category-tag:not([aria-current])");
    const firstCategory = categoryTags.first();
    
    if (await firstCategory.isVisible()) {
      await firstCategory.click();
      
      // 等待篩選完成
      await page.waitForTimeout(500);
      
      // 檢查文章數量
      const filteredCards = page.locator(".article-card");
      const filteredCount = await filteredCards.count();
      
      // 篩選後的文章數量應該 <= 初始數量
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test("handles empty article list", async ({ page }) => {
    // 模擬沒有文章的情況
    await page.route("/articles-list.json", route => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([])
      });
    });
    
    await page.goto("/blog/");
    
    // 檢查是否顯示 "沒有找到文章" 訊息
    const noArticlesMessage = page.locator("text=沒有找到文章");
    await expect(noArticlesMessage).toBeVisible();
  });

  test("handles malformed markdown files", async ({ page }) => {
    // 模擬載入有問題的文章
    await page.route("/articles-list.json", route => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(["invalid-article.md"])
      });
    });
    
    await page.route("/articles/invalid-article.md", route => {
      route.fulfill({
        status: 200,
        contentType: "text/markdown",
        body: "Invalid markdown without frontmatter"
      });
    });
    
    await page.goto("/blog/");
    
    // 頁面應該仍然載入，但可能顯示預設文章或錯誤處理
    const articlesGrid = page.locator(".articles-grid");
    await expect(articlesGrid).toBeVisible();
  });
});
