import { test, expect } from "@playwright/test";

test.describe("Article Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/");
  });

  test("article management info is displayed", async ({ page }) => {
    // 檢查文章管理資訊區塊
    const infoCard = page.locator(".info-card");
    await expect(infoCard).toBeVisible();
    
    // 檢查標題
    await expect(infoCard.locator("h3")).toContainText("文章管理");
    
    // 檢查說明文字
    await expect(infoCard.locator("p")).toContainText("Markdown 檔案管理");
    
    // 檢查步驟說明
    const steps = infoCard.locator("ol li");
    await expect(steps).toHaveCount(4);
    
    // 檢查按鈕
    const buttons = infoCard.locator(".btn");
    await expect(buttons).toHaveCount(2);
  });

  test("view articles folder button functionality", async ({ page }) => {
    const viewFolderBtn = page.getByRole("button", { name: "查看文章資料夾" });
    await expect(viewFolderBtn).toBeVisible();
    
    // 點擊按鈕應該開啟新視窗
    const [newPage] = await Promise.all([
      page.waitForEvent("popup"),
      viewFolderBtn.click()
    ]);
    
    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/\/articles\//);
    await newPage.close();
  });

  test("copy command button functionality", async ({ page }) => {
    const copyBtn = page.getByRole("button", { name: "複製指令" });
    await expect(copyBtn).toBeVisible();
    
    // 模擬點擊複製按鈕
    await copyBtn.click();
    
    // 檢查是否有提示訊息（透過 alert 或 toast）
    // 注意：實際的複製功能需要瀏覽器權限，這裡主要測試按鈕可點擊
    await expect(copyBtn).toBeEnabled();
  });

  test("article template exists", async ({ page }) => {
    // 檢查 template.md 檔案是否存在
    const response = await page.request.get("/articles/template.md");
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain("---");
    expect(content).toContain("title:");
    expect(content).toContain("category:");
    expect(content).toContain("date:");
    expect(content).toContain("readTime:");
    expect(content).toContain("image:");
  });

  test("articles list generation", async ({ page }) => {
    // 檢查 articles-list.json 是否正確生成
    const response = await page.request.get("/articles-list.json");
    expect(response.status()).toBe(200);
    
    const articlesList = await response.json();
    expect(Array.isArray(articlesList)).toBe(true);
    expect(articlesList.length).toBeGreaterThan(0);
    
    // 檢查檔案名格式
    articlesList.forEach(filename => {
      expect(filename).toMatch(/\.md$/);
    });
  });

  test("markdown file structure validation", async ({ page }) => {
    // 獲取文章列表
    const response = await page.request.get("/articles-list.json");
    const articlesList = await response.json();
    
    // 檢查每個文章檔案的結構
    for (const filename of articlesList.slice(0, 3)) { // 只檢查前3個檔案
      const articleResponse = await page.request.get(`/articles/${filename}`);
      expect(articleResponse.status()).toBe(200);
      
      const content = await articleResponse.text();
      
      // 檢查是否有 frontmatter
      expect(content).toMatch(/^---\s*\n/);
      expect(content).toMatch(/\n---\s*\n/);
      
      // 檢查必要的欄位
      expect(content).toMatch(/title:\s*".*"/);
      expect(content).toMatch(/category:\s*".*"/);
      expect(content).toMatch(/date:\s*"\d{4}-\d{2}-\d{2}"/);
      expect(content).toMatch(/readTime:\s*\d+/);
    }
  });

  test("article content rendering", async ({ page }) => {
    await page.waitForSelector(".article-card", { timeout: 10000 });
    
    const articleCards = page.locator(".article-card");
    const firstCard = articleCards.first();
    
    // 檢查圖片
    const image = firstCard.locator(".article-card__image");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src");
    await expect(image).toHaveAttribute("alt");
    
    // 檢查分類標籤
    const category = firstCard.locator(".article-card__category");
    await expect(category).toBeVisible();
    const categoryText = await category.textContent();
    expect(categoryText).toBeTruthy();
    
    // 檢查元資料
    const meta = firstCard.locator(".article-card__meta");
    await expect(meta).toBeVisible();
    const metaText = await meta.textContent();
    expect(metaText).toMatch(/\d{4}/); // 包含年份
    expect(metaText).toMatch(/\d+\s+min/); // 包含閱讀時間
    
    // 檢查標題
    const title = firstCard.locator(".article-card__title");
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText.length).toBeGreaterThan(0);
  });

  test("responsive article management info", async ({ page }) => {
    // 測試手機版
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    const infoCard = page.locator(".info-card");
    await expect(infoCard).toBeVisible();
    
    // 檢查按鈕在手機版是否正確排列
    const buttons = infoCard.locator(".btn");
    await expect(buttons).toHaveCount(2);
    
    // 測試平板版
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await expect(infoCard).toBeVisible();
    await expect(buttons).toHaveCount(2);
  });

  test("error handling for missing articles", async ({ page }) => {
    // 模擬文章載入失敗
    await page.route("/articles-list.json", route => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error" })
      });
    });
    
    await page.goto("/blog/");
    
    // 頁面應該仍然載入，可能顯示預設內容或錯誤處理
    const articlesGrid = page.locator(".articles-grid");
    await expect(articlesGrid).toBeVisible();
  });
});
