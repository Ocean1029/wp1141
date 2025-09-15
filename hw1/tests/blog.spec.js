import { test, expect } from "@playwright/test";

test.describe("Blog Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/");
  });

  test("blog page loads correctly", async ({ page }) => {
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面標題
    await expect(page).toHaveTitle(/Blog/);
    
    // 檢查主要標題
    const mainTitle = page.locator("h1.blog-title");
    await expect(mainTitle).toHaveText("All Articles");
    
    // 檢查文章網格存在
    const articlesGrid = page.locator(".articles-grid");
    await expect(articlesGrid).toBeVisible();
  });

  test("article cards are displayed", async ({ page }) => {
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    
    // 等待文章載入
    await page.waitForSelector(".article-card", { timeout: 10000 });
    
    // 檢查文章卡片數量（至少應該有預設的3篇）
    const articleCards = page.locator(".article-card");
    const count = await articleCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // 檢查每張卡片的基本結構
    const firstCard = articleCards.first();
    await expect(firstCard.locator(".article-card__image")).toBeVisible();
    await expect(firstCard.locator(".article-card__category")).toBeVisible();
    await expect(firstCard.locator(".article-card__meta")).toBeVisible();
    await expect(firstCard.locator(".article-card__title")).toBeVisible();
  });

  test("category filter functionality", async ({ page }) => {
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    
    // 等待分類載入
    await page.waitForSelector(".category-tag", { timeout: 10000 });
    
    // 檢查分類標籤存在
    const categoryTags = page.locator(".category-tag");
    const tagCount = await categoryTags.count();
    expect(tagCount).toBeGreaterThanOrEqual(1);
    
    // 檢查 "All" 標籤是預設選中狀態
    const allTag = page.getByRole("button", { name: "All" });
    await expect(allTag).toHaveClass(/active/);
    
    // 測試點擊分類篩選
    const recordingTag = page.getByRole("button", { name: "Recording software" });
    if (await recordingTag.isVisible()) {
      await recordingTag.click();
      await expect(recordingTag).toHaveClass(/active/);
      await expect(allTag).not.toHaveClass(/active/);
    }
  });

  test("article card hover effects", async ({ page }) => {
    // 等待文章載入
    await page.waitForSelector(".article-card", { timeout: 5000 });
    
    const firstCard = page.locator(".article-card").first();
    
    // 檢查 hover 前的狀態
    await expect(firstCard).toBeVisible();
    
    // 模擬 hover 效果
    await firstCard.hover();
    
    // 檢查 hover 後的視覺效果
    await expect(firstCard).toHaveCSS("transform", /matrix/);
    await expect(firstCard).toHaveCSS("box-shadow", /rgba/);
  });


  test("responsive layout on mobile", async ({ page }) => {
    // 設定手機版視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 重新載入頁面以觸發響應式佈局
    await page.reload();
    
    // 檢查文章網格在手機版是單欄
    const articlesGrid = page.locator(".articles-grid");
    const gridColumns = await articlesGrid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    expect(gridColumns).toMatch(/^[0-9.]+px$/); // 手機版應該是單欄，會顯示為具體像素值
    
    // 檢查分類篩選器在手機版是垂直排列
    const categoryFilter = page.locator(".category-filter");
    await expect(categoryFilter).toHaveCSS("flex-direction", "column");
  });

  test("responsive layout on tablet", async ({ page }) => {
    // 設定平板版視窗大小
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 重新載入頁面
    await page.reload();
    
    // 檢查文章網格在平板版是雙欄
    const articlesGrid = page.locator(".articles-grid");
    const gridColumns = await articlesGrid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    expect(gridColumns).toMatch(/^[0-9.]+px [0-9.]+px$/); // 平板版應該是雙欄，會顯示為兩個像素值
  });

  test("article card content structure", async ({ page }) => {
    // 等待文章載入
    await page.waitForSelector(".article-card", { timeout: 5000 });
    
    const firstCard = page.locator(".article-card").first();
    
    // 檢查圖片
    const image = firstCard.locator(".article-card__image");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("alt");
    
    // 檢查標題區域
    const header = firstCard.locator(".article-card__header");
    await expect(header).toBeVisible();
    
    // 檢查分類標籤
    const category = firstCard.locator(".article-card__category");
    await expect(category).toBeVisible();
    await expect(category).toHaveCSS("background-color", /rgb\(59, 130, 246\)/);
    
    // 檢查元資料（日期和閱讀時間）
    const meta = firstCard.locator(".article-card__meta");
    await expect(meta).toBeVisible();
    
    // 檢查標題
    const title = firstCard.locator(".article-card__title");
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS("font-weight", "600");
  });

  test("other topics dropdown functionality", async ({ page }) => {
    // 等待頁面載入
    await page.waitForSelector(".category-filter", { timeout: 5000 });
    
    // 檢查是否有 "Other topics" 按鈕
    const otherTopicsBtn = page.locator("#other-topics-btn");
    if (await otherTopicsBtn.isVisible()) {
      // 點擊按鈕
      await otherTopicsBtn.click();
      
      // 檢查下拉選單是否顯示
      const dropdown = page.locator("#other-topics-dropdown");
      await expect(dropdown).toHaveClass(/show/);
      
      // 再次點擊關閉
      await otherTopicsBtn.click();
      await expect(dropdown).not.toHaveClass(/show/);
    }
  });

  test("article filtering by category", async ({ page }) => {
    // 等待頁面載入
    await page.waitForSelector(".article-card", { timeout: 5000 });
    
    // 記錄初始文章數量
    const initialCards = page.locator(".article-card");
    const initialCount = await initialCards.count();
    
    // 嘗試點擊一個分類
    const categoryTags = page.locator(".category-tag:not([aria-current])");
    const firstCategory = categoryTags.first();
    
    if (await firstCategory.isVisible()) {
      const categoryName = await firstCategory.textContent();
      await firstCategory.click();
      
      // 檢查分類是否被選中
      await expect(firstCategory).toHaveClass(/active/);
      
      // 檢查文章數量可能減少（如果該分類文章較少）
      const filteredCards = page.locator(".article-card");
      const filteredCount = await filteredCards.count();
      
      // 至少應該有文章顯示
      expect(filteredCount).toBeGreaterThan(0);
    }
  });

  test("accessibility features", async ({ page }) => {
    // 檢查 skip link
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeVisible();
    
    // 檢查分類篩選的 aria-label
    const categoryFilter = page.locator("#category-filter");
    await expect(categoryFilter).toHaveAttribute("aria-label", "文章分類篩選");
    
    // 檢查文章網格的 aria-live
    const articlesGrid = page.locator("#articles-grid");
    await expect(articlesGrid).toHaveAttribute("aria-live", "polite");
  });

  test("markdown content loading", async ({ page }) => {
    // 等待文章載入
    await page.waitForSelector(".article-card", { timeout: 5000 });
    
    // 檢查文章是否從 Markdown 檔案載入
    const articleCards = page.locator(".article-card");
    const firstCard = articleCards.first();
    
    // 檢查是否有標題內容
    const title = firstCard.locator(".article-card__title");
    await expect(title).not.toBeEmpty();
    
    // 檢查是否有分類
    const category = firstCard.locator(".article-card__category");
    await expect(category).not.toBeEmpty();
    
    // 檢查是否有日期和閱讀時間
    const meta = firstCard.locator(".article-card__meta");
    await expect(meta).not.toBeEmpty();
  });
});
