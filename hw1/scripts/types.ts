/**
 * 型別定義檔案
 */

// 文章介面
export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: number;
  image: string;
  content: string;
  filename: string;
  pinned: boolean;
  slug: string;
}

// 分類介面
export interface Category {
  category: string;
  count: number;
}

// Frontmatter 介面
export interface Frontmatter {
  title: string;
  category: string;
  date: string;
  readTime?: number;
  image?: string;
  pinned?: boolean;
  slug?: string;
}

// 解析結果介面
export interface ParsedContent {
  frontmatter: Frontmatter;
  content: string;
}

// 文章卡片介面
export interface ArticleCard {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: number;
  image: string;
}

// 聯絡表單資料介面
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// 滾動動畫元素介面
export interface ScrollAnimationElement extends HTMLElement {
  style: CSSStyleDeclaration;
}

// 全域介面擴展
declare global {
  interface Window {
    featuredArticlesManager?: any;
    scrollAnimations?: any;
    MarkdownParser: any;
  }
}
