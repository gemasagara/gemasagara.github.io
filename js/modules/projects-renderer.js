// js/modules/projects-renderer.js
import { CONFIG } from '../config.js';
import dataLoader from './data-loader.js';
import renderer from './renderer.js';
import { projectCardTemplate } from '../utils/templates.js';
import { logInfo, sortBy } from '../utils/helpers.js';

class ProjectsRenderer {
  constructor() {
    this.projects = [];
    this.currentlyShown = CONFIG.PROJECTS_PER_PAGE;
    this.loadMoreBtn = null;
  }

  /**
   * Initialize projects section
   */
  async init() {
    try {
      logInfo('Initializing projects...');
      
      // Load project data
      this.projects = await dataLoader.loadData('projects');
      
      // Handle empty or invalid data gracefully
      if (!Array.isArray(this.projects) || this.projects.length === 0) {
        logInfo('No projects data available');
        this.projects = [];
        return;
      }
      
      // Sort by order
      this.projects = sortBy(this.projects, 'order', 'asc');
      
      // Render projects
      this.render();
      
      // Setup load more button
      this.setupLoadMore();
      
      logInfo('Projects initialized successfully');
    } catch (error) {
      logInfo('Failed to load projects, continuing without projects section:', error);
      this.projects = [];
    }
  }

  /**
   * Render all projects
   */
  render() {
    const container = document.querySelector(CONFIG.SELECTORS.projectsGrid);
    if (!container) return;

    // Render first batch (featured + initial hidden)
    renderer.renderList(container, this.projects, projectCardTemplate);
    
    // Update visibility
    this.updateVisibility();
  }

  /**
   * Update project visibility based on currentlyShown
   */
  updateVisibility() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
      if (index < this.currentlyShown) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  /**
   * Setup load more button functionality
   */
  setupLoadMore() {
    this.loadMoreBtn = document.querySelector(CONFIG.SELECTORS.loadMoreBtn);
    if (!this.loadMoreBtn) return;

    // Hide button if not enough projects
    if (this.projects.length <= CONFIG.PROJECTS_PER_PAGE) {
      this.loadMoreBtn.style.display = 'none';
      return;
    }

    // Add click handler
    this.loadMoreBtn.addEventListener('click', () => this.handleLoadMore());
  }

  /**
   * Handle load more button click
   */
  handleLoadMore() {
    const projectCards = document.querySelectorAll('.project-card');
    
    if (this.loadMoreBtn.textContent === 'Load More') {
      // Show next batch
      this.currentlyShown = Math.min(
        this.currentlyShown + CONFIG.PROJECTS_PER_PAGE,
        this.projects.length
      );
      
      this.updateVisibility();
      
      // Change button text if all shown
      if (this.currentlyShown >= this.projects.length) {
        this.loadMoreBtn.textContent = 'Show Less';
      }
    } else {
      // Hide all except first batch
      this.currentlyShown = CONFIG.PROJECTS_PER_PAGE;
      this.updateVisibility();
      this.loadMoreBtn.textContent = 'Load More';
      
      // Scroll to projects section
      const projectsSection = document.querySelector('#projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  /**
   * Filter projects by category
   */
  filterByCategory(category) {
    const filtered = category === 'all' 
      ? this.projects 
      : this.projects.filter(p => p.category === category);
    
    const container = document.querySelector(CONFIG.SELECTORS.projectsGrid);
    renderer.renderList(container, filtered, projectCardTemplate);
    
    this.currentlyShown = CONFIG.PROJECTS_PER_PAGE;
    this.updateVisibility();
  }

  /**
   * Search projects
   */
  search(term) {
    const searchTerm = term.toLowerCase();
    const filtered = this.projects.filter(project => {
      return (
        project.title.toLowerCase().includes(searchTerm) ||
        project.category.toLowerCase().includes(searchTerm) ||
        project.tagline.toLowerCase().includes(searchTerm) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    });
    
    const container = document.querySelector(CONFIG.SELECTORS.projectsGrid);
    if (filtered.length === 0) {
      renderer.render(container, '<p class="empty-state">No projects found matching your search.</p>');
    } else {
      renderer.renderList(container, filtered, projectCardTemplate);
    }
  }

  /**
   * Get projects by year
   */
  getProjectsByYear(year) {
    return this.projects.filter(p => p.year.includes(year));
  }

  /**
   * Get featured projects
   */
  getFeaturedProjects() {
    return this.projects.filter(p => p.featured);
    }
}
// Create singleton instance
const projectsRenderer = new ProjectsRenderer();
export default projectsRenderer;
export { ProjectsRenderer };