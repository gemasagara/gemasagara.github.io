// js/modules/about-renderer.js
import { CONFIG } from '../config.js';
import dataLoader from './data-loader.js';
import renderer from './renderer.js';
import { aboutTemplate } from '../utils/templates.js';
import { logInfo } from '../utils/helpers.js';

class AboutRenderer {
  constructor() {
    this.aboutData = null;
  }

  async init() {
    try {
      logInfo('Initializing about section...');
      this.aboutData = await dataLoader.loadData('about');

      // Handle empty or invalid data gracefully
      if (!this.aboutData || typeof this.aboutData !== 'object') {
        logInfo('No about data available');
        this.aboutData = null;
        return;
      }

      this.render();
      logInfo('About section initialized successfully');
    } catch (error) {
      logInfo('Failed to load about data, using default about:', error);
      this.aboutData = null;
    }
  }

  render() {
    if (!this.aboutData) return;

    const aboutContent = document.querySelector(CONFIG.SELECTORS.aboutSection);
    if (!aboutContent) return;

    renderer.render(aboutContent, aboutTemplate(this.aboutData));
  }
}

const aboutRenderer = new AboutRenderer();
export default aboutRenderer;
