// js/modules/parallax-gallery-hero.js
export default class ParallaxGalleryHero {
  constructor() {
    this.hero = document.querySelector('.gallery-hero');
    this.galleryContainer = document.querySelector('.gallery-container');
    this.initialScale = 1.2;
    this.minScale = 1.2;
    this.init();
  }

  init() {
    if (!this.hero) return;
    
    // Set initial values
    this.hero.style.setProperty('--gallery-hero-scale', this.initialScale);
    
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
    this.hero.style.setProperty('--gallery-hero-scale', scale);
    this.hero.style.setProperty('--gallery-hero-translate', `${translateY}px`);
    this.hero.style.setProperty('--gallery-hero-opacity', contentOpacity);
    this.hero.style.setProperty('--gallery-hero-content-translate', `${contentTranslate}px`);
  }
}
