// js/modules/parallax-hero.js
export default class ParallaxHero {
  constructor() {
    this.hero = document.querySelector('.hero');
    this.heroContent = document.querySelector('.hero-content');
    this.heroBackground = document.querySelector('.hero::after');
    this.initialScale = 1.6;
    this.minScale = 1;
    this.init();
  }

  init() {
    if (!this.hero) return;
    
    // Set initial values
    this.hero.style.setProperty('--hero-scale', this.initialScale);
    
    // Handle scroll event
    window.addEventListener('scroll', () => this.onScroll());
  }

  onScroll() {
    const scrollPosition = window.scrollY;
    const heroHeight = this.hero.offsetHeight;
    
    // Calculate scale based on scroll position
    // As user scrolls down, scale decreases from 1.6 to 1
    const scrollRatio = Math.min(scrollPosition / heroHeight, 1);
    const scale = this.initialScale - (scrollRatio * (this.initialScale - this.minScale));
    
    // Parallax background movement
    const translateY = scrollPosition * 0.5;
    
    // Content fade and slide up
    const contentOpacity = Math.max(1 - scrollRatio * 1.5, 0);
    const contentTranslate = scrollPosition * 0.3;
    
    // Apply transforms
    this.hero.style.setProperty('--hero-scale', scale);
    this.hero.style.setProperty('--hero-translate', `${translateY}px`);
    this.hero.style.setProperty('--hero-opacity', contentOpacity);
    this.hero.style.setProperty('--hero-content-translate', `${contentTranslate}px`);
  }
}
