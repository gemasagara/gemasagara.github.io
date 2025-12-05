// js/modules/awards-renderer.js
import { CONFIG } from '../config.js';
import dataLoader from './data-loader.js';
import renderer from './renderer.js';
import { awardItemTemplate } from '../utils/templates.js';
import { logInfo, sortBy } from '../utils/helpers.js';

class AwardsRenderer {
  constructor() {
    this.awards = [];
  }

  async init() {
    try {
      logInfo('Initializing awards...');
      this.awards = await dataLoader.loadData('awards');
      
      // Handle empty or invalid data gracefully
      if (!Array.isArray(this.awards) || this.awards.length === 0) {
        logInfo('No awards data available');
        this.awards = [];
        return;
      }
      
      this.awards = sortBy(this.awards, 'order', 'asc');
      this.render();
      logInfo('Awards initialized successfully');
    } catch (error) {
      logInfo('Failed to load awards, continuing without awards section:', error);
      this.awards = [];
    }
  }

  render() {
    const container = document.querySelector(CONFIG.SELECTORS.awardsList);
    if (!container) return;
    renderer.renderList(container, this.awards, awardItemTemplate);
  }
}

const awardsRenderer = new AwardsRenderer();
export default awardsRenderer;