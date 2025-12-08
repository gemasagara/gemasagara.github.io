// js/modules/navigation-renderer.js
import { CONFIG } from '../config.js';
import dataLoader from './data-loader.js';
import renderer from './renderer.js';
import { navItemTemplate } from '../utils/templates.js';
import { logInfo } from '../utils/helpers.js';

class NavigationRenderer {
  constructor() {
    this.navData = null;
    this.moonIcon = './data/images/moon_stars_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
    this.sunIcon = './data/images/light_mode_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
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

    // Initialize mobile menu
    this.initMobileMenu();
    
    this.addThemeToggleToNav();
  }

  initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', (e) => {
        navLinks.classList.toggle('show');
      });
    }

    // Close mobile menu when a nav link is clicked
    document.querySelectorAll('a[href^="index.html#"], a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function () {
        // Close mobile menu if open
        if (navLinks && navLinks.classList.contains('show')) {
          navLinks.classList.remove('show');
        }
      });
    });
  }

  addThemeToggleToNav() {
    const navLinksContainer = document.querySelector('.nav-links-container');
    const toggler = document.querySelector('.toggler');
    
    if (!navLinksContainer) return;
    
    const themeToggleBtn = document.createElement('button');
    themeToggleBtn.className = 'theme-toggle';
    themeToggleBtn.id = 'themeToggle';
    themeToggleBtn.setAttribute('aria-label', 'Toggle dark mode');
    themeToggleBtn.innerHTML = `
      <img id="themeIcon" src="./data/images/moon_stars_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" alt="Dark mode toggle">
    `;
    
    // Determine target container based on screen size
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const targetContainer = isMobile && toggler ? toggler : navLinksContainer;
    
    targetContainer.appendChild(themeToggleBtn);
    
    // Handle responsive behavior on window resize
    window.addEventListener('resize', () => {
      const themeToggle = document.getElementById('themeToggle');
      if (!themeToggle) return;
      
      const isMobileNow = window.matchMedia('(max-width: 768px)').matches;
      const currentParent = themeToggle.parentElement;
      const shouldBeInToggler = isMobileNow && toggler;
      const shouldBeInContainer = !isMobileNow && navLinksContainer;
      
      // Move to toggler if mobile and currently not in toggler
      if (shouldBeInToggler && currentParent !== toggler) {
        toggler.appendChild(themeToggle);
      }
      // Move to container if desktop and currently not in container
      else if (shouldBeInContainer && currentParent !== navLinksContainer) {
        navLinksContainer.appendChild(themeToggle);
      }
    });
    
    // Initialize theme toggle functionality
    this.initThemeToggle();
  }

  initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    // Check for saved theme preference, otherwise use system preference
    const initTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        this.enableDarkMode(body, themeIcon);
      } else {
        this.disableDarkMode(body, themeIcon);
      }
    };

    const toggleTheme = () => {
      if (body.classList.contains('dark-mode')) {
        this.disableDarkMode(body, themeIcon);
      } else {
        this.enableDarkMode(body, themeIcon);
      }
    };

    // Initialize theme on first load
    initTheme();

    // Add click listener to toggle button
    themeToggle.addEventListener('click', toggleTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        e.matches ? this.enableDarkMode(body, themeIcon) : this.disableDarkMode(body, themeIcon);
      }
    });
  }

  enableDarkMode(body, themeIcon) {
    body.classList.add('dark-mode');
    themeIcon.src = this.sunIcon;
    localStorage.setItem('theme', 'dark');
    this.updateScrollProgress();
  }

  disableDarkMode(body, themeIcon) {
    body.classList.remove('dark-mode');
    themeIcon.src = this.moonIcon;
    localStorage.setItem('theme', 'light');
    this.updateScrollProgress();
  }

  updateScrollProgress() {
    // Trigger update of scroll progress icon color
    const event = new CustomEvent('themeChanged');
    document.dispatchEvent(event);
  }
}

const navigationRenderer = new NavigationRenderer();
export default navigationRenderer;