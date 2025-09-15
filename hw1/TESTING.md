# Blog 自動化測試

這個專案包含了完整的 blog 功能自動化測試套件，使用 Playwright 進行端到端測試。

## 🧪 測試結構

### 測試檔案
- `tests/blog.spec.js` - Blog 頁面主要功能測試
- `tests/markdown-parser.spec.js` - Markdown 解析器測試
- `tests/article-management.spec.js` - 文章管理功能測試
- `tests/blog-performance.spec.js` - 效能測試
- `tests/home.spec.js` - 首頁測試（已存在）

### 測試覆蓋範圍

#### Blog 頁面測試 (`blog.spec.js`)
- ✅ 頁面載入和基本結構
- ✅ 文章卡片顯示和內容
- ✅ 分類篩選功能
- ✅ Hover 效果測試
- ✅ 響應式佈局（手機、平板、桌面）
- ✅ 無障礙功能
- ✅ Markdown 內容載入

#### Markdown 解析器測試 (`markdown-parser.spec.js`)
- ✅ 文章從 Markdown 檔案載入
- ✅ Frontmatter 解析正確性
- ✅ 圖片載入和錯誤處理
- ✅ 分類計數和排序
- ✅ 文章篩選功能
- ✅ 錯誤處理（空列表、格式錯誤）

#### 文章管理測試 (`article-management.spec.js`)
- ✅ 文章管理資訊顯示
- ✅ 按鈕功能（查看資料夾、複製指令）
- ✅ 文章範本驗證
- ✅ 文章列表生成
- ✅ Markdown 檔案結構驗證
- ✅ 響應式文章管理介面

#### 效能測試 (`blog-performance.spec.js`)
- ✅ 頁面載入效能
- ✅ 文章載入效能
- ✅ 分類篩選效能
- ✅ Hover 動畫效能
- ✅ 圖片載入效能
- ✅ 記憶體使用測試
- ✅ 響應式佈局效能
- ✅ 無障礙效能
- ✅ 錯誤恢復效能

## 🚀 執行測試

### 基本測試指令

```bash
# 執行所有測試
npm test

# 執行特定測試檔案
npm run test:blog
npm run test:markdown
npm run test:management
npm run test:performance

# 使用 UI 模式執行測試
npm run test:ui

# 使用瀏覽器視窗執行測試
npm run test:headed

# 除錯模式
npm run test:debug

# 查看測試報告
npm run test:report
```

### 測試環境設定

測試會自動：
1. 啟動開發伺服器 (`npm run dev`)
2. 等待伺服器就緒
3. 執行測試
4. 生成測試報告

### 瀏覽器支援

測試支援多種瀏覽器：
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

## 📊 測試報告

測試完成後會生成：
- **HTML 報告** - 視覺化測試結果
- **JSON 報告** - `test-results.json`
- **JUnit 報告** - `test-results.xml`

## 🔧 測試配置

### Playwright 配置 (`playwright.config.js`)
- 測試目錄：`./tests`
- 基礎 URL：`http://localhost:5174`
- 並行執行：是
- 重試次數：CI 環境 2 次，本地 0 次
- 截圖：僅失敗時
- 錄影：僅失敗時
- 追蹤：首次重試時

### 測試超時設定
- 頁面載入：10 秒
- 元素等待：5-10 秒
- 效能測試：3 秒內完成

## 🐛 除錯測試

### 常見問題

1. **測試超時**
   ```bash
   # 增加超時時間
   npm run test:debug
   ```

2. **元素找不到**
   ```bash
   # 檢查元素選擇器
   npm run test:headed
   ```

3. **圖片載入失敗**
   ```bash
   # 檢查網路請求
   npm run test:debug
   ```

### 除錯技巧

1. **使用 UI 模式**
   ```bash
   npm run test:ui
   ```

2. **查看測試報告**
   ```bash
   npm run test:report
   ```

3. **檢查控制台輸出**
   ```bash
   npm run test:headed
   ```

## 📈 持續整合

### GitHub Actions 範例

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎯 測試最佳實踐

1. **獨立性** - 每個測試都是獨立的
2. **可重複性** - 測試結果一致
3. **快速執行** - 測試在合理時間內完成
4. **清晰命名** - 測試名稱描述清楚
5. **適當等待** - 使用適當的等待策略
6. **錯誤處理** - 測試錯誤情況
7. **效能監控** - 監控關鍵效能指標

## 📝 新增測試

### 新增測試檔案
1. 在 `tests/` 目錄建立新的 `.spec.js` 檔案
2. 使用 Playwright 測試 API
3. 遵循現有的測試結構

### 測試範例
```javascript
import { test, expect } from "@playwright/test";

test.describe("New Feature", () => {
  test("should work correctly", async ({ page }) => {
    await page.goto("/blog/");
    await expect(page.locator("h1")).toBeVisible();
  });
});
```

## 🔍 監控和維護

- 定期執行測試確保功能正常
- 監控測試執行時間
- 更新測試以反映功能變更
- 保持測試覆蓋率
- 修復失敗的測試
