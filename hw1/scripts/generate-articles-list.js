/**
 * 生成文章列表的腳本
 * 掃描 articles 資料夾並生成 articles-list.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateArticlesList() {
  const articlesDir = path.join(__dirname, '../articles');
  const outputFile = path.join(__dirname, '../public/articles-list.json');
  
  try {
    // 確保 public 資料夾存在
    const publicDir = path.dirname(outputFile);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // 讀取 articles 資料夾
    const files = fs.readdirSync(articlesDir);
    
    // 過濾出 .md 檔案並排除 template.md
    const markdownFiles = files
      .filter(file => file.endsWith('.md') && file !== 'template.md' && file !== 'README.md')
      .sort((a, b) => {
        // 按檔案名排序（通常是日期）
        return b.localeCompare(a);
      });
    
    // 寫入 JSON 檔案
    fs.writeFileSync(outputFile, JSON.stringify(markdownFiles, null, 2));
    
    console.log(`✅ 已生成文章列表: ${markdownFiles.length} 篇文章`);
    console.log('文章檔案:', markdownFiles);
    
  } catch (error) {
    console.error('❌ 生成文章列表時發生錯誤:', error);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  generateArticlesList();
}

export default generateArticlesList;
