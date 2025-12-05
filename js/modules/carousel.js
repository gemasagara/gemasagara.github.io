/**
 * Infinite Carousel Module
 * Handles smooth auto-scrolling carousel with pause on hover
 */

import { logInfo } from '../utils/helpers.js';

class Carousel {
  constructor(selector) {
    this.container = document.querySelector(selector);
    this.isInitialized = false;
    this.isScrolling = false;
    this.scrollStep = 2;
    this.animationId = null;
    this.isHovered = false;
    this.checkInterval = 100; // ms between scroll position checks
    this.maxScrollLeft = 0;
    this.originalCardsCount = 0;
  }

  /**
   * Initialize carousel
   */
  init() {
    if (!this.container || this.isInitialized) return;

    const cards = this.container.querySelectorAll('.featured-card');
    if (cards.length === 0) {
      logInfo('Carousel: No cards found, skipping initialization');
      return;
    }

    this.originalCardsCount = cards.length;
    logInfo(`Carousel: Initializing with ${this.originalCardsCount} cards`);

    this.setupCloning();
    this.setupEventListeners();
    this.startAutoScroll();

    this.isInitialized = true;
  }

  /**
   * Clone cards for infinite effect
   */
  setupCloning() {
    const originalCards = Array.from(
      this.container.querySelectorAll('.featured-card:not(.cloned-card)')
    );

    // Clear existing clones
    this.container.querySelectorAll('.cloned-card').forEach(card => card.remove());

    // Calculate how many clones we need
    const containerWidth = this.container.parentElement.offsetWidth;
    const firstCard = originalCards[0];
    if (!firstCard) return;

    const cardStyle = window.getComputedStyle(firstCard);
    const cardWidth =
      firstCard.offsetWidth +
      parseInt(cardStyle.marginRight) +
      parseInt(cardStyle.marginLeft);
    const gap = parseInt(window.getComputedStyle(this.container).gap || 0);
    const totalCardWidth = cardWidth + gap;
    const cardsNeeded = Math.ceil(containerWidth / totalCardWidth) + 3;

    // Clone cards
    for (let i = 0; i < cardsNeeded; i++) {
      originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('cloned-card');
        this.container.appendChild(clone);
      });
    }

    this.maxScrollLeft =
      totalCardWidth * this.originalCardsCount * 2;
  }

  /**
   * Setup hover and resize listeners
   */
  setupEventListeners() {
    // Pause on hover
    this.container.addEventListener('mouseenter', () => {
      this.isHovered = true;
      logInfo('Carousel: Paused on hover');
    });

    this.container.addEventListener('mouseleave', () => {
      this.isHovered = false;
      logInfo('Carousel: Resumed scrolling');
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        logInfo('Carousel: Resizing carousel on window resize');
        cancelAnimationFrame(this.animationId);
        this.setupCloning();
        this.startAutoScroll();
      }, 250);
    });

    // Pause on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(this.animationId);
        logInfo('Carousel: Paused (page hidden)');
      } else {
        this.startAutoScroll();
        logInfo('Carousel: Resumed (page visible)');
      }
    });
  }

  /**
   * Start auto-scrolling
   */
  startAutoScroll() {
    if (!this.container) return;

    const scroll = () => {
      if (!this.isHovered && !document.hidden) {
        const currentScroll = this.container.scrollLeft;

        // Check if we've reached the reset point
        if (currentScroll >= this.maxScrollLeft / 2) {
          // Reset to start smoothly
          this.container.scrollLeft = 0;
          logInfo(
            `Carousel: Reset scroll position (was at ${currentScroll})`
          );
        } else {
          // Normal scroll increment
          this.container.scrollLeft = currentScroll + this.scrollStep;
        }
      }

      this.animationId = requestAnimationFrame(scroll);
    };

    this.animationId = requestAnimationFrame(scroll);
  }

  /**
   * Stop carousel
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.isInitialized = false;
  }
}

export default Carousel;
