/**
 * Legacy Interactions - DOM-based functionality
 * Handles: mobile menu, smooth scrolling, back-to-top button, carousel
 */

import Carousel from '../modules/carousel.js';

// ===== Mobile Menu Toggle =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navLogo = document.querySelector('.nav-logo');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    if (navLogo) {
      navLogo.classList.toggle('show');
    }
  });
}

// ===== Smooth Scrolling for Navigation Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 70,
        behavior: 'smooth',
      });
    }

    // Close mobile menu if open
    if (navLinks && navLinks.classList.contains('show')) {
      navLinks.classList.remove('show');
      if (navLogo) {
        navLogo.classList.remove('show');
      }
    }
  });
});

// ===== Back to Top Button =====
const backToTopBtn = document.querySelector('.back-to-top');

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

// ===== Initialize Carousel =====
document.addEventListener('DOMContentLoaded', () => {
  const carousel = new Carousel('.featured-grid');
  carousel.init();

  // Expose for debugging
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    window.portfolioCarousel = carousel;
  }
});

// ===== Manual Scroll Controls for Cards =====
function scrollCards(which, direction) {
  let container = null;
  if (which === 'exp') {
    container = document.querySelector('.exp-grid');
  } else {
    container = document.querySelector('.leadership-grid');
  }

  if (!container) return;

  const scrollAmount = 350;

  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

// Make scrollCards globally accessible for inline onclick handlers
window.scrollCards = scrollCards;
