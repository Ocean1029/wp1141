#!/usr/bin/env node

/**
 * 新增文章腳本
 * 用法: node scripts/new-article.js "文章標題" "分類"
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateFilename(title) {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替換為連字符
    .substring(0, 50); // 限制長度
  
  return `${date}-${slug}.md`;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替換為連字符
    .substring(0, 50); // 限制長度
}

function generateArticleContent(title, category, image) {
  const date = new Date().toISOString().split('T')[0];
  const readTime = Math.max(1, Math.ceil(title.length / 10)); // 簡單估算閱讀時間
  const slug = generateSlug(title);
  
  return `---
title: "${title}"
category: "${category}"
date: "${date}"
readTime: ${readTime}
image: "${image}"
pinned: false
slug: "${slug}"
---

# ${title}

在這裡寫您的文章內容...

## 子標題

您可以使用 Markdown 語法來格式化文章：

- 列表項目
- 另一個項目

**粗體文字** 和 *斜體文字*

[連結](https://example.com)

\`\`\`javascript
// 程式碼區塊
console.log('Hello World');
\`\`\`

> 引用文字

---

文章結尾...`;
}

async function createNewArticle() {
  try {
    console.log('📝 新增文章\n');
    
    // 獲取輸入
    const title = await question('文章標題: ');
    if (!title.trim()) {
      console.log('❌ 標題不能為空');
      process.exit(1);
    }
    
    const category = await question('分類: ');
    if (!category.trim()) {
      console.log('❌ 分類不能為空');
      process.exit(1);
    }
    
    const image = await question('圖片 URL (可選): ') || 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=200&fit=crop';
    
    // 生成檔案名和內容
    const filename = generateFilename(title);
    const content = generateArticleContent(title, category, image);
    
    // 寫入檔案
    const articlesDir = path.join(__dirname, '../articles');
    const filePath = path.join(articlesDir, filename);
    
    fs.writeFileSync(filePath, content);
    
    console.log(`\n✅ 文章已建立: ${filename}`);
    console.log(`📁 檔案位置: ${filePath}`);
    console.log('\n📋 下一步:');
    console.log('1. 編輯文章內容');
    console.log('2. 重新載入 blog 頁面查看效果');
    console.log('3. 執行 npm run build 更新文章列表');
    
  } catch (error) {
    console.error('❌ 建立文章時發生錯誤:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 如果直接執行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  createNewArticle();
}

export { createNewArticle, generateFilename, generateArticleContent };
