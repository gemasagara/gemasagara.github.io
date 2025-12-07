// js/main.js
import { CONFIG } from './config.js';
import { logInfo, logError, debounce } from './utils/helpers.js';
import dataLoader from './modules/data-loader.js';
import heroRenderer from './modules/hero-renderer.js';
import aboutRenderer from './modules/about-renderer.js';
import projectsRenderer from './modules/projects-renderer.js';
import experiencesRenderer from './modules/experiences-renderer.js';
import leadershipRenderer from './modules/leadership-renderer.js';
import teamsRenderer from './modules/teams-renderer.js';
import awardsRenderer from './modules/awards-renderer.js';
import ParallaxHero from './modules/parallax-hero.js';
import ScrollProgress from './modules/scroll-progress.js';

class App {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) {
      logInfo('App already initialized');
      return;
    }

    try {
      logInfo('Initializing application...');
      
      // Show loading state
      this.showGlobalLoading();

      // Initialize all renderers in parallel
      // Note: Renderers handle errors gracefully, so we won't throw
      // Navigation is handled separately by init-navigation.js (centralized for all pages)
      await Promise.all([
        heroRenderer.init(),
        aboutRenderer.init(),
        projectsRenderer.init(),
        experiencesRenderer.init(),
        leadershipRenderer.init(),
        teamsRenderer.init(),
        awardsRenderer.init()
      ]);

      // Hide loading state
      this.hideGlobalLoading();

      // Initialize interactions (scroll animations, etc.)
      this.initInteractions();

      this.initialized = true;
      logInfo('Application initialized successfully');

    } catch (error) {
      logError('Error during initialization (continuing gracefully):', error);
      this.hideGlobalLoading();
      // Don't show error overlay - renderers handle their own sections
    }
  }

  showGlobalLoading() {
    // Optional: Add a full-page loading overlay
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = '<div class="spinner"></div>';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    document.body.appendChild(loader);
  }

  hideGlobalLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.remove();
    }
  }

  showGlobalError() {
    this.hideGlobalLoading();
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
      z-index: 9999;
    `;
    errorDiv.innerHTML = `
      <h2>Oops! Something went wrong</h2>
      <p>We couldn't load the page content.</p>
      <button onclick="location.reload()" class="btn">Reload Page</button>
    `;
    document.body.appendChild(errorDiv);
  }

  initInteractions() {
    // Initialize parallax hero effect
    new ParallaxHero();
    
    // Initialize scroll progress bar
    new ScrollProgress();
    
    // Scroll animations with debounce
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeInOnScroll = () => {
      fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
        
        if (isVisible) {
          element.classList.add('appear');
        }
      });
    };

    // Run on load
    fadeInOnScroll();

    // Run on scroll - no debounce for smooth fade-in during scrolling
    window.addEventListener('scroll', fadeInOnScroll);
  }

  // Public API for debugging
  getAppState() {
    return {
      initialized: this.initialized,
      cacheStats: dataLoader.getCacheStats(),
      projects: projectsRenderer.projects.length,
      experiences: experiencesRenderer.experiences.length,
      leadership: leadershipRenderer.leadership.length,
      teams: teamsRenderer.teams.length,
      awards: awardsRenderer.awards.length
    };
  }

  // Refresh specific content
  async refreshProjects() {
    dataLoader.clearCacheFor(CONFIG.ENDPOINTS.projects);
    await projectsRenderer.init();
  }

  async refreshAll() {
    dataLoader.clearCache();
    await this.init();
  }
}

// Create app instance
const app = new App();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Expose app to window for debugging (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.portfolioApp = app;
  console.log('💡 Development mode: Access app via window.portfolioApp');
}

// Export for testing
export default app;