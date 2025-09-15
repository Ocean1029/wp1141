# Blog 內容管理系統

這是一個基於 Markdown 檔案的 blog 內容管理系統，讓您可以透過 Git 來管理文章。

## 🚀 快速開始

### 1. 新增文章

使用指令快速建立新文章：

```bash
npm run new-article
```

這會引導您輸入：
- 文章標題
- 分類
- 圖片 URL（可選）

### 2. 手動建立文章

在 `articles/` 資料夾中建立新的 `.md` 檔案，格式如下：

```markdown
---
title: "文章標題"
category: "分類名稱"
date: "2025-01-15"
readTime: 5
image: "https://example.com/image.jpg"
---

# 文章標題

文章內容...
```

### 3. 更新文章列表

每次新增或修改文章後，執行：

```bash
npm run generate-articles
```

## 📁 檔案結構

```
articles/
├── README.md                    # 說明文件
├── template.md                  # 文章範本
├── 2025-01-15-test-article.md  # 範例文章
└── ...                         # 其他文章

public/
└── articles-list.json          # 自動生成的文章列表
```

## 🛠️ 開發指令

```bash
# 啟動開發伺服器（會自動生成文章列表）
npm run dev

# 建置網站（會自動生成文章列表）
npm run build

# 手動生成文章列表
npm run generate-articles

# 新增文章
npm run new-article
```

## 📝 文章格式

### Frontmatter 欄位

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `title` | string | ✅ | 文章標題 |
| `category` | string | ✅ | 文章分類 |
| `date` | string | ✅ | 發布日期 (YYYY-MM-DD) |
| `readTime` | number | ❌ | 預估閱讀時間（分鐘） |
| `image` | string | ❌ | 文章封面圖片 URL |

### 檔案命名建議

使用日期和標題的組合：
```
YYYY-MM-DD-article-title.md
```

例如：`2025-01-15-hello-world.md`

## 🎨 功能特色

- ✅ **分類篩選**：根據文章分類自動排序和篩選
- ✅ **響應式設計**：支援桌面和手機版
- ✅ **版本控制**：透過 Git 管理文章版本
- ✅ **自動生成**：自動掃描文章並生成列表
- ✅ **Markdown 支援**：使用標準 Markdown 語法
- ✅ **無資料庫**：純靜態網站，易於部署

## 🚀 部署

這個系統可以部署到任何靜態網站託管服務：

- **GitHub Pages**：推送到 GitHub 自動部署
- **Netlify**：連接 Git 倉庫自動部署
- **Vercel**：支援靜態網站部署
- **任何靜態託管**：上傳 `dist/` 資料夾即可

## 🔧 自訂

### 修改分類顯示數量

在 `scripts/main.js` 中修改：

```javascript
this.maxVisibleCategories = 5; // 最多顯示5個分類
```

### 修改文章排序

在 `scripts/markdown-parser.js` 中修改排序邏輯：

```javascript
// 按日期排序（最新的在前）
this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
```

## 📞 支援

如果遇到問題，請檢查：

1. 文章檔案是否在 `articles/` 資料夾中
2. Frontmatter 格式是否正確
3. 是否執行了 `npm run generate-articles`
4. 瀏覽器控制台是否有錯誤訊息
