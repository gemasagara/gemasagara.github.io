// js/modules/teams-renderer.js
import { CONFIG } from '../config.js';
import dataLoader from './data-loader.js';
import renderer from './renderer.js';
import { teamCardTemplate } from '../utils/templates.js';
import { logInfo, sortBy } from '../utils/helpers.js';

class TeamsRenderer {
  constructor() {
    this.teams = [];
  }

  async init() {
    try {
      logInfo('Initializing teams...');
      this.teams = await dataLoader.loadData('teams');
      
      // Handle empty or invalid data gracefully
      if (!Array.isArray(this.teams) || this.teams.length === 0) {
        logInfo('No teams data available');
        this.teams = [];
        return;
      }
      
      this.teams = sortBy(this.teams, 'order', 'asc');
      this.render();
      logInfo('Teams initialized successfully');
    } catch (error) {
      logInfo('Failed to load teams, continuing without teams section:', error);
      this.teams = [];
    }
  }

  render() {
    const container = document.querySelector(CONFIG.SELECTORS.teamsGrid);
    if (!container) return;
    
    // Clear existing cards (including old clones)
    container.innerHTML = '';
    
    // Render teams
    renderer.renderList(container, this.teams, teamCardTemplate);
  }
}

const teamsRenderer = new TeamsRenderer();
export default teamsRenderer;