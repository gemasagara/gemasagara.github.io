// js/modules/navigation-renderer.js
import { CONFIG } from '../config.js';
import dataLoader from './data-loader.js';
import renderer from './renderer.js';
import { navItemTemplate } from '../utils/templates.js';
import { logInfo } from '../utils/helpers.js';

class NavigationRenderer {
  constructor() {
    this.navData = null;
  }

  async init() {
    try {
      logInfo('Initializing navigation...');
      this.navData = await dataLoader.loadData('navigation');
      this.render();
      logInfo('Navigation initialized successfully');
    } catch (error) {
      logInfo('Using default navigation (JSON load failed)');
    }
  }

  render() {
    if (!this.navData) return;

    // Update logo
    const logoImg = document.querySelector('.logo');
    const logoName = document.querySelector('.logo-name');
    
    if (logoImg && this.navData.logo.image) {
      logoImg.src = this.navData.logo.image;
    }
    
    if (logoName && this.navData.logo.text) {
      logoName.textContent = this.navData.logo.text;
    }

    // Render navigation items
    const navLinks = document.querySelector(CONFIG.SELECTORS.navLinks);
    if (navLinks && this.navData.items) {
      renderer.renderList(navLinks, this.navData.items, navItemTemplate);
    }
  }
}

const navigationRenderer = new NavigationRenderer();
export default navigationRenderer;