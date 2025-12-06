// js/modules/scroll-progress.js
export default class ScrollProgress {
  constructor() {
    this.progressFill = document.querySelector('.scroll-progress-fill');
    this.progressIcon = document.querySelector('.scroll-progress-icon');
    this.init();
  }

  init() {
    if (!this.progressFill || !this.progressIcon) return;
    window.addEventListener('scroll', () => this.updateProgress());
  }

  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    this.progressFill.style.width = scrollPercent + '%';
    this.progressIcon.style.left = scrollPercent + '%';
  }
}
