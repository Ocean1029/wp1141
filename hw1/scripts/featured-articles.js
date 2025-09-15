/**
 * Featured Articles Handler
 * 處理主頁的釘選文章顯示
 */

class FeaturedArticlesManager {
  constructor() {
    this.articles = [];
    this.featuredGrid = document.getElementById('featured-articles-grid');
    this.maxFeatured = 3; // 最多顯示 3 篇釘選文章
    this.init();
  }

  async init() {
    if (!this.featuredGrid) return;
    
    try {
      await this.loadArticles();
      this.renderFeaturedArticles();
    } catch (error) {
      console.error('載入釘選文章失敗:', error);
      this.showError();
    }
  }

  async loadArticles() {
    try {
      // 嘗試使用 MarkdownParser 載入文章
      if (typeof MarkdownParser !== 'undefined') {
        const parser = new MarkdownParser();
        this.articles = await parser.loadArticles();
        return;
      }
    } catch (error) {
      console.warn('MarkdownParser 載入失敗，使用備用方法:', error);
    }
    
    // 備用方法：直接載入文章列表
    const response = await fetch('/articles-list.json');
    if (response.ok) {
      const articleFiles = await response.json();
      // 載入每篇文章的詳細內容
      this.articles = [];
      for (const filename of articleFiles) {
        try {
          const articleResponse = await fetch(`/articles/${filename}`);
          if (articleResponse.ok) {
            const content = await articleResponse.text();
            const article = this.parseArticleContent(content, filename);
            if (article) {
              this.articles.push(article);
            }
          }
        } catch (error) {
          console.warn(`Failed to load article ${filename}:`, error);
        }
      }
    } else {
      throw new Error('無法載入文章列表');
    }
  }

  parseArticleContent(content, filename) {
    try {
      // 解析 frontmatter
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
      if (!frontmatterMatch) {
        return null;
      }

      const frontmatterText = frontmatterMatch[1];
      const markdownContent = frontmatterMatch[2];
      
      // 簡單的 YAML 解析器
      const frontmatter = {};
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
          if (!isNaN(value) && value !== '') {
            value = Number(value);
          }
          
          // 轉換布林值
          if (value === 'true') {
            value = true;
          } else if (value === 'false') {
            value = false;
          }
          
          frontmatter[key] = value;
        }
      });

      return {
        id: filename.replace('.md', ''),
        title: frontmatter.title,
        category: frontmatter.category,
        date: frontmatter.date,
        readTime: frontmatter.readTime || 5,
        image: frontmatter.image || 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=200&fit=crop',
        content: markdownContent,
        filename: filename,
        pinned: frontmatter.pinned || false,
        slug: frontmatter.slug || filename.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
      };
    } catch (error) {
      console.error(`Error parsing article ${filename}:`, error);
      return null;
    }
  }

  getFeaturedArticles() {
    // 只篩選出釘選的文章
    const featured = this.articles.filter(article => article.pinned === true);
    
    // 按日期排序（最新的在前）
    featured.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return featured.slice(0, this.maxFeatured);
  }

  createFeaturedArticleCard(article) {
    const card = document.createElement('a');
    card.className = 'featured-article-card';
    card.href = `/blog/#${article.slug}`;
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    // 生成文章摘要（取前 150 個字符）
    const excerpt = article.content 
      ? article.content.replace(/[#*`]/g, '').substring(0, 150).trim() + '...'
      : '點擊閱讀完整內容...';

    card.innerHTML = `
      <img 
        src="${article.image}" 
        alt="${article.title}" 
        class="featured-article-card__image"
        onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMkEyQjJCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'"
      >
      <div class="featured-article-card__content">
        <div class="featured-article-card__header">
          <span class="featured-article-card__category">${article.category}</span>
          <div class="featured-article-card__meta">
            <span>${formatDate(article.date)}</span>
            <span>${article.readTime} min</span>
          </div>
        </div>
        <h3 class="featured-article-card__title">${article.title}</h3>
        <p class="featured-article-card__excerpt">${excerpt}</p>
      </div>
    `;

    return card;
  }

  renderFeaturedArticles() {
    if (!this.featuredGrid) return;
    
    const featuredArticles = this.getFeaturedArticles();
    
    if (featuredArticles.length === 0) {
      this.showNoArticles();
      return;
    }
    
    // 清空現有內容
    this.featuredGrid.innerHTML = '';
    
    // 渲染釘選文章卡片
    featuredArticles.forEach(article => {
      const card = this.createFeaturedArticleCard(article);
      this.featuredGrid.appendChild(card);
    });
  }

  showNoArticles() {
    this.featuredGrid.innerHTML = `
      <div class="featured-articles__empty">
        <h3>暫無精選文章</h3>
        <p>目前沒有精選文章，請稍後再來查看。</p>
        <a href="/blog/" class="btn btn--outline">
          查看所有文章
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 17L17 7"></path>
            <path d="M7 7h10v10"></path>
          </svg>
        </a>
      </div>
    `;
  }

  showError() {
    this.featuredGrid.innerHTML = `
      <div class="featured-articles__error">
        <h3>載入文章時發生錯誤</h3>
        <p>無法載入精選文章，請檢查網路連線或稍後再試。</p>
        <div class="featured-articles__error-actions">
          <button onclick="location.reload()" class="btn btn--primary">
            重新載入
          </button>
          <a href="/blog/" class="btn btn--outline">
            查看所有文章
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7"></path>
              <path d="M7 7h10v10"></path>
            </svg>
          </a>
        </div>
      </div>
    `;
  }
}

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
  // 只在主頁初始化釘選文章
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    window.featuredArticlesManager = new FeaturedArticlesManager();
  }
});

// 導出供其他模組使用
export default FeaturedArticlesManager;
