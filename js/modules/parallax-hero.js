// js/modules/parallax-hero.js
export default class ParallaxHero {
  constructor() {
    this.hero = document.querySelector('.hero');
    this.heroBackground = document.querySelector('.hero::after');
    this.initialScale = 1.4;
    this.minScale = 1;
    this.init();
  }

  init() {
    if (!this.hero) return;
    
    // Handle scroll event
    window.addEventListener('scroll', () => this.onScroll());
  }

  onScroll() {
    const scrollPosition = window.scrollY;
    const heroHeight = this.hero.offsetHeight;
    
    // Calculate scale based on scroll position
    // As user scrolls down, scale decreases from 1.2 to 1
    const scrollRatio = Math.min(scrollPosition / heroHeight, 1);
    const scale = this.initialScale - (scrollRatio * (this.initialScale - this.minScale));
    
    // Apply transform to the background (::after pseudo-element)
    this.hero.style.setProperty('--hero-scale', scale);
  }
}
