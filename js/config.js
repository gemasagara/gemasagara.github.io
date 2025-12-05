// js/config.js
export const CONFIG = {
  // Data file paths
  DATA_PATH: './data',
  
  // Endpoints
  ENDPOINTS: {
    siteConfig: '/data/site-config.json',
    navigation: '/data/navigation.json',
    hero: '/data/hero.json',
    about: '/data/about.json',
    projects: '/data/projects.json',
    experiences: '/data/experiences.json',
    leadership: '/data/leadership.json',
    teams: '/data/teams.json',
    awards: '/data/awards.json',
    blogMetadata: '/data/blogs/metadata.json'
  },
  
  // Settings
  PROJECTS_PER_PAGE: 3,
  CAROUSEL_SPEED: 1,
  ANIMATION_THRESHOLD: 100,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Selectors
  SELECTORS: {
    projectsGrid: '#projects-grid',
    experiencesGrid: '.exp-grid',
    leadershipGrid: '.leadership-grid',
    teamsGrid: '.featured-grid',
    awardsList: '.awards-list',
    loadMoreBtn: '#load-more-btn',
    navLinks: '.nav-links',
    heroSection: '.hero',
    aboutSection: '.about-content'
  },
  
  // Feature flags
  FEATURES: {
    enableCache: true,
    enableLazyLoading: true,
    enableAnalytics: false
  }
};