// Minimal bootstrap for static site. No framework.
// - Injects Header/Footer HTML
// - Sets active nav state
// - Adds small UX niceties

/** Fetch and inject an HTML partial into a target element. */
async function injectPartial(targetSelector, url) {
  const el = document.querySelector(targetSelector);
  if (!el) return;
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div role="alert">Failed to load ${url}</div>`;
  }
}

/** Mark the current nav link with aria-current based on pathname. */
function setActiveNav(container = document) {
  const current = (location.pathname || "/").replace(/\/+$/, "") || "/";
  container.querySelectorAll('[data-path]').forEach((link) => {
    const path = link.getAttribute('data-path') || '';
    const normalized = path.replace(/\/+$/, '') || '/';
    if (current === normalized || current.startsWith(normalized + "/")) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

/** Initialize footer dynamic year. */
function setFooterYear(container = document) {
  const y = container.querySelector("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function initContactForm(doc = document) {
  const form = doc.querySelector("#contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent navigation
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    console.info("Contact payload:", payload); // debug log

    const toast = doc.querySelector("#toast");
    if (toast) {
      toast.textContent = "Message sent (fake).";
      toast.style.color = "var(--success)";
    }
    form.reset();
  });
}

// Blog functionality
class BlogManager {
  constructor() {
    this.articles = [];
    this.currentFilter = 'all';
    this.maxVisibleCategories = 5; // 最多顯示5個分類
    this.parser = new MarkdownParser();
    this.init();
  }

  async loadArticles() {
    try {
      this.articles = await this.parser.loadArticles();
      console.log(`載入了 ${this.articles.length} 篇文章`);
      return this.articles;
    } catch (error) {
      console.error('載入文章時發生錯誤:', error);
      // 如果載入失敗，使用預設資料
      this.articles = this.getDefaultArticles();
      return this.articles;
    }
  }

  getDefaultArticles() {
    return [
      {
        id: "2025-09-09-zoom-recording",
        title: "How to Record Zoom Meetings With or Without Permission",
        category: "Recording software",
        image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=200&fit=crop",
        date: "2025-09-09",
        readTime: 16
      },
      {
        id: "2025-09-08-podcast-software",
        title: "20 Best Podcast Recording Software for Pros & Beginners | 2025",
        category: "Podcast Software",
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=200&fit=crop",
        date: "2025-09-08",
        readTime: 10
      },
      {
        id: "2025-09-05-zoom-alternatives",
        title: "8 Best Zoom Alternatives for Every Use Case in 2025",
        category: "Recording software",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
        date: "2025-09-05",
        readTime: 12
      }
    ];
  }

  getCategories() {
    return this.parser.getCategories();
  }

  renderCategories() {
    const categories = this.getCategories();
    const categoryList = document.getElementById('category-list');
    const otherTopics = document.getElementById('other-topics');
    const otherTopicsDropdown = document.getElementById('other-topics-dropdown');
    
    if (!categoryList) return;

    // 清空現有內容
    categoryList.innerHTML = '';
    otherTopicsDropdown.innerHTML = '';

    // 顯示前幾個分類
    const visibleCategories = categories.slice(0, this.maxVisibleCategories);
    const hiddenCategories = categories.slice(this.maxVisibleCategories);

    // 渲染可見分類
    visibleCategories.forEach(({ category }) => {
      const tag = document.createElement('button');
      tag.className = 'category-tag';
      tag.textContent = category;
      tag.addEventListener('click', () => this.filterByCategory(category));
      categoryList.appendChild(tag);
    });

    // 如果有隱藏的分類，顯示 "Other topics"
    if (hiddenCategories.length > 0) {
      otherTopics.style.display = 'block';
      hiddenCategories.forEach(({ category }) => {
        const tag = document.createElement('button');
        tag.className = 'category-tag';
        tag.textContent = category;
        tag.addEventListener('click', () => this.filterByCategory(category));
        otherTopicsDropdown.appendChild(tag);
      });
    } else {
      otherTopics.style.display = 'none';
    }

    // 添加 "All" 選項
    const allTag = document.createElement('button');
    allTag.className = 'category-tag';
    allTag.textContent = 'All';
    allTag.addEventListener('click', () => this.filterByCategory('all'));
    categoryList.insertBefore(allTag, categoryList.firstChild);
  }

  filterByCategory(category) {
    this.currentFilter = category;
    this.renderArticles();
    this.updateActiveCategory();
  }

  updateActiveCategory() {
    document.querySelectorAll('.category-tag').forEach(tag => {
      tag.classList.remove('active');
    });
    
    const activeTag = Array.from(document.querySelectorAll('.category-tag'))
      .find(tag => tag.textContent === this.currentFilter || 
        (this.currentFilter === 'all' && tag.textContent === 'All'));
    
    if (activeTag) {
      activeTag.classList.add('active');
    }
  }

  renderArticles() {
    const articlesGrid = document.getElementById('articles-grid');
    if (!articlesGrid) return;

    const filteredArticles = this.parser.filterByCategory(this.currentFilter);

    articlesGrid.innerHTML = '';

    if (filteredArticles.length === 0) {
      articlesGrid.innerHTML = '<p style="color: var(--font-400); text-align: center; grid-column: 1 / -1;">沒有找到文章</p>';
      return;
    }

    filteredArticles.forEach(article => {
      const card = this.createArticleCard(article);
      articlesGrid.appendChild(card);
    });
  }

  createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-TW', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    card.innerHTML = `
      <img src="${article.image}" alt="${article.title}" class="article-card__image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMkEyQjJCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'">
      <div class="article-card__content">
        <span class="article-card__category">${article.category}</span>
        <div class="article-card__meta">
          <span>${formatDate(article.date)}</span>
          <span>${article.readTime} min</span>
        </div>
        <h3 class="article-card__title">${article.title}</h3>
      </div>
    `;

    return card;
  }

  // 文章現在透過 Markdown 檔案管理，不需要動態新增

  initAddArticleForm() {
    const addBtn = document.getElementById('add-article-btn');
    const form = document.getElementById('add-article-form');
    const articleForm = document.getElementById('article-form');
    const cancelBtn = document.getElementById('cancel-add');

    if (!addBtn || !form || !articleForm || !cancelBtn) return;

    addBtn.addEventListener('click', () => {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });

    cancelBtn.addEventListener('click', () => {
      form.style.display = 'none';
      articleForm.reset();
    });

    articleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(articleForm);
      const articleData = Object.fromEntries(formData.entries());
      
      this.addArticle(articleData);
      form.style.display = 'none';
      articleForm.reset();
    });
  }

  initOtherTopicsDropdown() {
    const otherTopicsBtn = document.getElementById('other-topics-btn');
    const dropdown = document.getElementById('other-topics-dropdown');

    if (!otherTopicsBtn || !dropdown) return;

    otherTopicsBtn.addEventListener('click', () => {
      const isOpen = otherTopicsBtn.classList.contains('open');
      if (isOpen) {
        otherTopicsBtn.classList.remove('open');
        dropdown.classList.remove('show');
      } else {
        otherTopicsBtn.classList.add('open');
        dropdown.classList.add('show');
      }
    });

    // 點擊外部關閉下拉選單
    document.addEventListener('click', (e) => {
      if (!otherTopicsBtn.contains(e.target) && !dropdown.contains(e.target)) {
        otherTopicsBtn.classList.remove('open');
        dropdown.classList.remove('show');
      }
    });
  }

  async init() {
    await this.loadArticles();
    this.renderCategories();
    this.renderArticles();
    this.initAddArticleForm();
    this.initOtherTopicsDropdown();
    this.updateActiveCategory();
  }
}

function initBlog(doc = document) {
  // 只在 blog 頁面初始化
  if (location.pathname.includes('/blog')) {
    new BlogManager();
  }
}


/** Main entry. */
async function bootstrap() {
  await Promise.all([
    injectPartial("#site-header", "/components/Header.html"),
    injectPartial("#site-footer", "/components/Footer.html"),
  ]);
  setActiveNav(document);
  setFooterYear(document);
  initContactForm(document);
  initBlog(document);
  console.info("Bootstrap complete");
}

bootstrap();

