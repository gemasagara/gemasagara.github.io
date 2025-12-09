// js/modules/hero-renderer.js
import { CONFIG } from '../config.js';
import dataLoader from './data-loader.js';
import renderer from './renderer.js';
import { heroTemplate } from '../utils/templates.js';
import { logInfo } from '../utils/helpers.js';

class HeroRenderer {
  constructor() {
    this.heroData = null;
  }

  async init() {
    try {
      console.log('🔍 HeroRenderer.init() called');
      logInfo('Initializing hero section...');
      this.heroData = await dataLoader.loadData('hero');
      console.log('📦 Hero data loaded:', this.heroData);

      // Handle empty or invalid data gracefully
      if (!this.heroData || typeof this.heroData !== 'object') {
        console.error('❌ Hero data is invalid:', this.heroData);
        logInfo('No hero data available');
        this.heroData = null;
        return;
      }

      console.log('✅ Calling render()');
      this.render();
      logInfo('Hero section initialized successfully');
    } catch (error) {
      console.error('❌ Error in HeroRenderer.init():', error);
      logInfo('Failed to load hero data, using default hero:', error);
      this.heroData = null;
    }
  }

  render() {
    if (!this.heroData) {
      console.error('No hero data available');
      return;
    }

    const heroSection = document.querySelector('.hero');
    if (!heroSection) {
      console.error('Hero section element not found');
      return;
    }

    // Set the background image from hero.json
    if (this.heroData.backgroundImage) {
      const bgImageUrl = `url('${this.heroData.backgroundImage}')`;
      console.log('Setting hero background image:', bgImageUrl);
      // Set CSS variable
      document.documentElement.style.setProperty('--hero-bg-image', bgImageUrl);
      // Also apply directly to the hero element's ::after pseudo-element via a style tag
      const styleId = 'hero-bg-style';
      let styleTag = document.getElementById(styleId);
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = `.hero::after { background-image: ${bgImageUrl} !important; }`;
    } else {
      console.warn('No backgroundImage in hero data');
    }

    renderer.render(heroSection, heroTemplate(this.heroData));
  }
}

const heroRenderer = new HeroRenderer();
export default heroRenderer;
