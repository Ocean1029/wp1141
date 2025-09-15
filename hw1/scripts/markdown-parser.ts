/**
 * Markdown Parser for Blog Articles
 * 解析 Markdown 檔案並提取 frontmatter 和內容
 */

import type { Article, Category, Frontmatter, ParsedContent } from './types.js';

export class MarkdownParser {
  private articles: Article[] = [];

  /**
   * 解析 frontmatter (YAML 格式的檔案頭部)
   */
  parseFrontmatter(content: string): ParsedContent {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      throw new Error('Invalid frontmatter format');
    }

    const frontmatterText = match[1];
    const markdownContent = match[2];
    
    // 簡單的 YAML 解析器
    const frontmatter: Frontmatter = {
      title: '',
      category: '',
      date: ''
    };
    
    frontmatterText.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // 移除引號
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // 轉換數字
        if (!isNaN(Number(value)) && value !== '') {
          value = String(Number(value));
        }
        
        // 轉換布林值
        if (key === 'pinned') {
          (frontmatter as any)[key] = value === 'true';
        } else if (key === 'readTime') {
          (frontmatter as any)[key] = Number(value) || 5;
        } else {
          (frontmatter as any)[key] = value;
        }
      }
    });

    return { frontmatter, content: markdownContent };
  }

  /**
   * 載入所有文章檔案
   */
  async loadArticles(): Promise<Article[]> {
    try {
      // 在開發環境中，我們需要從伺服器獲取文章列表
      const response = await fetch('/articles-list.json');
      if (!response.ok) {
        throw new Error('Failed to load articles list');
      }
      
      const articleFiles: string[] = await response.json();
      this.articles = [];

      for (const filename of articleFiles) {
        try {
          const article = await this.loadArticle(filename);
          if (article) {
            this.articles.push(article);
          }
        } catch (error) {
          console.warn(`Failed to load article ${filename}:`, error);
        }
      }

      // 按日期排序（最新的在前）
      this.articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return this.articles;
    } catch (error) {
      console.error('Error loading articles:', error);
      return [];
    }
  }

  /**
   * 載入單篇文章
   */
  async loadArticle(filename: string): Promise<Article | null> {
    try {
      const response = await fetch(`/articles/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      
      const content = await response.text();
      const { frontmatter, content: markdownContent } = this.parseFrontmatter(content);
      
      return {
        id: filename.replace('.md', ''),
        title: frontmatter.title,
        category: frontmatter.category,
        date: frontmatter.date,
        readTime: Number(frontmatter.readTime) || 5,
        image: frontmatter.image || 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=200&fit=crop',
        content: markdownContent,
        filename: filename,
        pinned: frontmatter.pinned === true,
        slug: frontmatter.slug || filename.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
      };
    } catch (error) {
      console.error(`Error loading article ${filename}:`, error);
      return null;
    }
  }

  /**
   * 獲取所有分類
   */
  getCategories(): Category[] {
    const categoryCount: Record<string, number> = {};
    this.articles.forEach(article => {
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 根據分類篩選文章
   */
  filterByCategory(category: string): Article[] {
    if (category === 'all') {
      return this.articles;
    }
    return this.articles.filter(article => article.category === category);
  }

  /**
   * 搜尋文章
   */
  searchArticles(query: string): Article[] {
    const lowercaseQuery = query.toLowerCase();
    return this.articles.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.category.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// 匯出供其他模組使用
export default MarkdownParser;

// 同時設定到全域變數供舊代碼使用
if (typeof window !== 'undefined') {
  window.MarkdownParser = MarkdownParser;
}
