// js/modules/leadership-renderer.js
import { CONFIG } from '../config.js';
import dataLoader from './data-loader.js';
import renderer from './renderer.js';
import { leadershipCardTemplate } from '../utils/templates.js';
import { logInfo, sortBy } from '../utils/helpers.js';

class LeadershipRenderer {
  constructor() {
    this.leadership = [];
  }

  async init() {
    try {
      logInfo('Initializing leadership...');
      this.leadership = await dataLoader.loadData('leadership');
      
      // Handle empty or invalid data gracefully
      if (!Array.isArray(this.leadership) || this.leadership.length === 0) {
        logInfo('No leadership data available');
        this.leadership = [];
        return;
      }
      
      this.leadership = sortBy(this.leadership, 'order', 'asc');
      this.render();
      logInfo('Leadership initialized successfully');
    } catch (error) {
      logInfo('Failed to load leadership, continuing without leadership section:', error);
      this.leadership = [];
    }
  }

  render() {
    const container = document.querySelector(CONFIG.SELECTORS.leadershipGrid);
    if (!container) return;
    renderer.renderList(container, this.leadership, leadershipCardTemplate);
  }
}

const leadershipRenderer = new LeadershipRenderer();
export default leadershipRenderer;