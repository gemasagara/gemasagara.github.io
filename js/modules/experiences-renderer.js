// js/modules/experiences-renderer.js
import { CONFIG } from '../config.js';
import dataLoader from './data-loader.js';
import renderer from './renderer.js';
import { experienceCardTemplate } from '../utils/templates.js';
import { logInfo, sortBy } from '../utils/helpers.js';

class ExperiencesRenderer {
  constructor() {
    this.experiences = [];
  }

  async init() {
    try {
      logInfo('Initializing experiences...');
      this.experiences = await dataLoader.loadData('experiences');
      
      // Handle empty or invalid data gracefully
      if (!Array.isArray(this.experiences) || this.experiences.length === 0) {
        logInfo('No experiences data available');
        this.experiences = [];
        return;
      }
      
      this.experiences = sortBy(this.experiences, 'order', 'asc');
      this.render();
      logInfo('Experiences initialized successfully');
    } catch (error) {
      logInfo('Failed to load experiences, continuing without experiences section:', error);
      this.experiences = [];
    }
  }

  render() {
    const container = document.querySelector(CONFIG.SELECTORS.experiencesGrid);
    if (!container) return;
    renderer.renderList(container, this.experiences, experienceCardTemplate);
  }
}

const experiencesRenderer = new ExperiencesRenderer();
export default experiencesRenderer;