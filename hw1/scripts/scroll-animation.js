/**
 * Scroll Animation Handler
 * 處理頁面滾動時的漸進出現動畫效果
 */

class ScrollAnimation {
  constructor() {
    this.elements = document.querySelectorAll('.scroll-animate');
    this.threshold = 0.1; // 元素進入視窗 10% 時觸發動畫
    this.rootMargin = '0px 0px -50px 0px'; // 提前 50px 觸發
    this.init();
  }

  init() {
    // 檢查是否支援 Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // 如果不支援，直接顯示所有元素
      this.elements.forEach(el => el.classList.add('animate'));
      return;
    }

    // 創建 Intersection Observer
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );

    // 開始觀察所有動畫元素
    this.elements.forEach(el => {
      this.observer.observe(el);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 元素進入視窗，添加動畫類別
        entry.target.classList.add('animate');
        
        // 停止觀察已動畫的元素（可選，節省效能）
        this.observer.unobserve(entry.target);
      }
    });
  }

  // 手動觸發所有動畫（用於測試）
  triggerAll() {
    this.elements.forEach(el => {
      el.classList.add('animate');
    });
  }

  // 重置所有動畫
  reset() {
    this.elements.forEach(el => {
      el.classList.remove('animate');
    });
  }

  // 銷毀觀察器
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
  // 只在 about 頁面初始化滾動動畫
  if (window.location.pathname.includes('/about')) {
    window.scrollAnimation = new ScrollAnimation();
  }
});

// 導出供其他模組使用
export default ScrollAnimation;
