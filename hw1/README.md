# Ocean Tseng 個人網站

曾煥軒的個人網站，展示個人資訊、技術文章和作品集（作品集還在施工）。採用純 HTML/CSS/TypeScript 撰寫，現在程式架構終於比較乾淨了（但 styles/base.css 還是很醜）。

## 專案特色

- **純前端**：使用原生 HTML、CSS、TypeScript
- **響應式設計**：在任何裝置看起來應該都不會出事？
- **動態內容管理**：基於 Markdown 的文章系統，當今天 update articles 時，可以動態渲染在 blogs 上。
- **效能優化**：使用 Vite 建構工具，支援 ES 模組和現代瀏覽器特性。
- **自動化測試**：整合 Playwright 進行測試，哇要過這堆測試也是夠麻煩。


## 專案結構

```
hw1/
├── about/                    # 關於頁面
│   └── index.html
├── articles/                 # Markdown 文章檔案
│   ├── blablabla.md
│   ├── template.md
│   └── README.md
├── assets/                   # 靜態資源
│   ├── cv/                   # 履歷檔案
│   └── images/               # 圖片資源
├── blog/                     # 部落格頁面
│   └── index.html
├── components/               # 可重用元件
│   ├── Header.html
│   └── Footer.html
├── public/                   # 公開資源
│   └── articles-list.json    # 文章列表快取
├── scripts/                  # TypeScript 模組
│   ├── main.ts               # 主要邏輯
│   ├── markdown-parser.ts    # Markdown 解析器
│   ├── featured-articles.ts  # 精選文章管理
│   ├── scroll-animations.ts  # 滾動動畫
│   ├── generate-articles-list.ts  # 文章列表生成
│   ├── new-article.ts        # 新文章模板
│   └── types.ts              # 型別定義
├── styles/                   # 樣式檔案
│   ├── tokens.css            # 設計系統變數
│   └── base.css              # 主要樣式
├── tests/                    # 測試檔案
│   ├── home.spec.js
│   ├── blog.spec.js
│   ├── about-scroll-animation.spec.js
│   ├── featured-articles.spec.js
│   └── blog-performance.spec.js
├── index.html                # 首頁
├── package.json              # 專案配置
├── vite.config.ts            # Vite 配置
├── playwright.config.js      # Playwright 測試配置
└── README.md                 # 專案說明
```

## 快速開始

### 環境需求

- Node.js 16+ 
- npm 或 pnpm
- TypeScript 5.0+

### 安裝與執行

1. **安裝依賴**
   ```bash
   npm install
   # 或
   pnpm install
   ```

2. **開發模式**
   ```bash
   npm run dev
   ```
   網站將在 `http://localhost:5173` 啟動

3. **建構生產版本**
   ```bash
   npm run build
   ```

4. **預覽生產版本**
   ```bash
   npm run preview
   ```

### 測試

```bash
# 執行所有測試
npm test

# 執行特定測試
npm run test:blog
npm run test:performance

# 開啟測試 UI
npm run test:ui

# 除錯模式
npm run test:debug
```

## 設計理念

### 視覺設計

**深色主題設計**
- 採用深色背景 (`#0b0c0f`) 搭配淺色文字 (`#f5f7fa`)
- 使用藍色系品牌色彩 (`#3b82f6`) 作為主要強調色

**現代化 UI 元素**
- 卡片式佈局，提供清晰的內容分組
- 微妙的陰影效果，增強視覺深度

**響應式設計**
- 移動優先的設計方法
- 彈性網格系統，適配各種螢幕尺寸
- 觸控友好的互動元素

### 技術架構


**元件化思維**
- Header 和 Footer 作為可重用元件
- 模組化的 JavaScript 功能
- 統一的樣式系統

**效能優化**
- 使用 Vite 進行快速開發和建構
- 圖片懶載入和錯誤處理
- 最小化 JavaScript 包大小

### 內容管理

**Markdown 驅動**
- 文章使用 Markdown 格式撰寫
- 支援 YAML frontmatter 元數據
- 自動生成文章列表和分類

**動態內容載入**
- 客戶端解析 Markdown 內容
- 支援文章分類和篩選
- 精選文章功能

## 🔧 核心功能

### 1. 首頁 (Home)
- 個人介紹和視覺展示
- 功能導航卡片
- 社交媒體連結
- 精選文章展示

### 2. 關於頁面 (About)
- 個人履歷和技能展示
- 時間軸式經歷呈現
- 滾動動畫效果
- 履歷下載功能

### 3. 部落格 (Blog)
- 文章列表和分類篩選
- Markdown 內容解析
- 響應式文章卡片
- 搜尋和篩選功能

### 4. 文章管理
- 基於檔案的內容管理
- 自動生成文章列表
- 支援文章分類和標籤
- 精選文章功能

## 🎯 技術亮點

### 1. 模組化架構
```javascript
// 主要功能模組化
class BlogManager {
  constructor() {
    this.articles = [];
    this.parser = new MarkdownParser();
  }
  // ...
}
```

### 2. 設計系統
```css
:root {
  /* 統一的設計變數 */
  --bg: #0b0c0f;
  --fg: #f5f7fa;
  --brand-600: #3b82f6;
  /* ... */
}
```

### 3. 無障礙設計
```html
<a class="skip-link" href="#main">Skip to content</a>
<nav role="navigation" aria-label="Main navigation">
```

### 4. 效能優化
- 使用 `requestAnimationFrame` 優化滾動動畫
- 圖片錯誤處理和備用方案
- 模組化載入，減少初始包大小

## 🧪 測試策略

### 端到端測試
- 使用 Playwright 進行跨瀏覽器測試
- 涵蓋主要用戶流程
- 響應式設計測試
- 效能測試

### 測試覆蓋範圍
- 首頁功能測試
- 部落格頁面測試
- 滾動動畫測試
- 精選文章功能測試
- 效能基準測試

## 📱 瀏覽器支援

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權條款

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 📞 聯絡資訊

- **作者**: Ocean Tseng (曾煥軒)
- **Email**: vanessa0201029@gmail.com
- **GitHub**: [@ocean-tseng](https://github.com/ocean-tseng)
- **網站**: https://ocean-tseng.dev

---

*此專案為台大資管系網頁程式設計課程作業，展示現代前端開發的最佳實踐。*