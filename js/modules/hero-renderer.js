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
      logInfo('Initializing hero section...');
      this.heroData = await dataLoader.loadData('hero');

      // Handle empty or invalid data gracefully
      if (!this.heroData || typeof this.heroData !== 'object') {
        logInfo('No hero data available');
        this.heroData = null;
        return;
      }

      this.render();
      logInfo('Hero section initialized successfully');
    } catch (error) {
      logInfo('Failed to load hero data, using default hero:', error);
      this.heroData = null;
    }
  }

  render() {
    if (!this.heroData) return;

    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    renderer.render(heroSection, heroTemplate(this.heroData));
  }
}

const heroRenderer = new HeroRenderer();
export default heroRenderer;
