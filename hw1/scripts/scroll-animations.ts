/**
 * Scroll Animations Handler
 * 處理頁面滾動時的動畫效果
 */

// import type { ScrollAnimationElement } from './types.js';

export class ScrollAnimations {
  private animatedElements: Set<HTMLElement> = new Set();

  constructor() {
    this.init();
  }

  init(): void {
    // 等待 DOM 載入完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
    } else {
      this.setupAnimations();
    }
  }

  setupAnimations(): void {
    // 為需要滾動動畫的元素添加初始狀態
    const elementsToAnimate = document.querySelectorAll(`
      .features-header,
      .feature-card,
      .featured-articles__header,
      .featured-article-card,
      .scroll-animate
    `);

    elementsToAnimate.forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.opacity = '0';
      htmlElement.style.transform = 'translateY(30px)';
      htmlElement.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    });

    // 設置滾動監聽器
    this.setupScrollListener();
    
    // 初始檢查（處理已經在視窗內的元素）
    this.checkElements();
  }

  setupScrollListener(): void {
    let ticking = false;

    const handleScroll = (): void => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.checkElements();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  checkElements(): void {
    // 檢查 features 區域
    this.checkFeaturesSection();
    
    // 檢查其他元素
    const otherElements = document.querySelectorAll(`
      .featured-articles__header,
      .featured-article-card,
      .scroll-animate
    `);

    otherElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      if (this.animatedElements.has(htmlElement)) return;

      if (this.isElementInViewport(htmlElement)) {
        this.animateElement(htmlElement);
        this.animatedElements.add(htmlElement);
      }
    });
  }

  checkFeaturesSection(): void {
    const featuresSection = document.querySelector('.features') as HTMLElement;
    if (!featuresSection || this.animatedElements.has(featuresSection)) return;

    if (this.isElementInViewport(featuresSection)) {
      // 同時觸發 features-header 和所有 feature-card 的動畫
      const featuresHeader = featuresSection.querySelector('.features-header') as HTMLElement;
      const featureCards = featuresSection.querySelectorAll('.feature-card');

      if (featuresHeader && !this.animatedElements.has(featuresHeader)) {
        this.animateElement(featuresHeader);
        this.animatedElements.add(featuresHeader);
      }

      // 所有 feature-card 同時動畫，但有錯開延遲
      featureCards.forEach((card, index) => {
        const htmlCard = card as HTMLElement;
        if (!this.animatedElements.has(htmlCard)) {
          setTimeout(() => {
            this.animateElement(htmlCard);
            this.animatedElements.add(htmlCard);
          }, index * 100); // 每個卡片延遲 100ms
        }
      });

      this.animatedElements.add(featuresSection);
    }
  }

  isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // 當元素進入視窗的 80% 時觸發動畫
    return rect.top <= windowHeight * 0.8 && rect.bottom >= 0;
  }

  animateElement(element: HTMLElement): void {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }

  // 重置動畫（用於測試或重新載入）
  reset(): void {
    this.animatedElements.clear();
    
    // 重置 features 區域
    const featuresSection = document.querySelector('.features') as HTMLElement;
    if (featuresSection) {
      const featuresHeader = featuresSection.querySelector('.features-header') as HTMLElement;
      const featureCards = featuresSection.querySelectorAll('.feature-card');
      
      if (featuresHeader) {
        featuresHeader.style.opacity = '0';
        featuresHeader.style.transform = 'translateY(30px)';
      }
      
      featureCards.forEach(card => {
        const htmlCard = card as HTMLElement;
        htmlCard.style.opacity = '0';
        htmlCard.style.transform = 'translateY(30px)';
      });
    }
    
    // 重置其他元素
    const otherElements = document.querySelectorAll(`
      .featured-articles__header,
      .featured-article-card
    `);

    otherElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.opacity = '0';
      htmlElement.style.transform = 'translateY(30px)';
    });
  }
}

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
  window.scrollAnimations = new ScrollAnimations();
});

// 導出供其他模組使用
export default ScrollAnimations;
