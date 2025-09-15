/**
 * Article Detail Page Handler
 * 處理文章詳情頁面的載入和顯示
 */

import type { Article } from './types.js';
import MarkdownParser from './markdown-parser.js';

class ArticleDetailManager {
  private parser: MarkdownParser;
  private articleContent: HTMLElement | null;
  private articleTitle: HTMLElement | null;

  constructor() {
    this.parser = new MarkdownParser();
    this.articleContent = document.getElementById('article-content');
    this.articleTitle = document.getElementById('article-title');
    this.init();
  }

  async init(): Promise<void> {
    const slug = this.getSlugFromURL();
    if (!slug) {
      this.showError('找不到文章');
      return;
    }

    try {
      const article = await this.loadArticleBySlug(slug);
      if (article) {
        this.renderArticle(article);
        this.updatePageTitle(article.title);
      } else {
        this.showError('文章不存在');
      }
    } catch (error) {
      console.error('載入文章失敗:', error);
      this.showError('載入文章時發生錯誤');
    }
  }

  getSlugFromURL(): string | null {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // 檢查 URL 路徑
    const pathMatch = path.match(/\/article\/(.+)/);
    if (pathMatch) {
      return pathMatch[1];
    }
    
    // 檢查 hash 參數（用於 blog 頁面的錨點連結）
    const hashMatch = hash.match(/#(.+)/);
    if (hashMatch) {
      return hashMatch[1];
    }
    
    // 檢查查詢參數
    const urlParams = new URLSearchParams(window.location.search);
    const slugParam = urlParams.get('slug');
    if (slugParam) {
      return slugParam;
    }
    
    return null;
  }

  async loadArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const articles = await this.parser.loadArticles();
      return articles.find(article => article.slug === slug) || null;
    } catch (error) {
      console.error('載入文章列表失敗:', error);
      return null;
    }
  }

  renderArticle(article: Article): void {
    if (!this.articleContent) return;

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    // 將 Markdown 內容轉換為 HTML（簡單版本）
    const htmlContent = this.markdownToHtml(article.content);

    this.articleContent.innerHTML = `
      <div class="article-header">
        <h1 class="article-title">${article.title}</h1>
        <div class="article-meta">
          <div class="article-datetime">
            <span class="article-read-time">${article.readTime} min read</span>
            <span class="article-date">${formatDate(article.date)}</span>
          </div>
        </div>
        <div class="article-image">
          <img src="${article.image}" alt="${article.title}" />
        </div>
      </div>
      
      <div class="article-body">
        ${htmlContent}
      </div>
      
      <div class="article-footer">
        <a href="/blog/" class="btn btn--outline">
          ← 返回文章列表
        </a>
      </div>
    `;
  }

  markdownToHtml(markdown: string): string {
    return markdown
      // 標題
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // 粗體和斜體
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // 連結
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // 列表
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      
      // 程式碼區塊
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // 引用
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      
      // 段落
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|u|b|p|d])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>')
      
      // 清理多餘的標籤
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<[h|u|b|d])/g, '$1')
      .replace(/(<\/[h|u|b|d]>)<\/p>/g, '$1');
  }

  updatePageTitle(title: string): void {
    if (this.articleTitle) {
      this.articleTitle.textContent = `${title} — Ocean`;
    }
    document.title = `${title} — Ocean`;
  }

  showError(message: string): void {
    if (!this.articleContent) return;

    this.articleContent.innerHTML = `
      <div class="article-error">
        <h1>錯誤</h1>
        <p>${message}</p>
        <a href="/blog/" class="btn btn--primary">
          返回文章列表
        </a>
      </div>
    `;
  }
}

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
  // 只在文章詳情頁面初始化
  if (window.location.pathname.startsWith('/article/') || 
      window.location.pathname === '/article/') {
    new ArticleDetailManager();
  }
});

export default ArticleDetailManager;
